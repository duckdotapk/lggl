//
// Imports
//

import { z } from "zod";

//
// Schemas
//

export const MessageSchema = z.object(
{
	code: z.string(),
	message: z.string(),
});

export const ErrorResponseBodySchema = z.object(
{
	success: z.literal(false),
	errors: z.array(MessageSchema),
});

export const SuccessResponseBodySchema = z.object(
{
	success: z.literal(true),
	warnings: z.array(MessageSchema).optional(),
});

export const ResponseBodySchema = z.union(
[
	ErrorResponseBodySchema,
	SuccessResponseBodySchema,
]);

//
// Types
//

export type Message = z.infer<typeof MessageSchema>;

export type ErrorResponseBody = z.infer<typeof ErrorResponseBodySchema>;

export type SuccessResponseBody = z.infer<typeof SuccessResponseBodySchema>;

export type ResponseBody = z.infer<typeof ResponseBodySchema>;

//
// Classes
//

export class XhrAbortedError extends Error
{

}

export class XhrErrorError extends Error
{

}

//
// Utility Functions
//

export type ApiRequestOptions
<
	RequestBodySchema extends z.ZodObject | z.ZodUnion<readonly
	[
		z.ZodObject,
		...z.ZodObject[],
	]>,
	ResponseBodySchema extends z.ZodUnion<readonly
	[
		typeof SuccessResponseBodySchema,
		typeof ErrorResponseBodySchema,
	]>,
> =
{
	baseUrl?: string;
	schema:
	{
		method: "GET" | "POST";
		path: string;
		RequestBodySchema: RequestBodySchema;
		ResponseBodySchema: ResponseBodySchema;
	};
	requestBody: z.input<RequestBodySchema>;
	onUploadProgress?: (progressEvent: ProgressEvent<EventTarget>) => void | null;
};

export type ApiRequestResult
<
	ResponseBodySchema extends z.ZodUnion<readonly
	[
		typeof SuccessResponseBodySchema,
		typeof ErrorResponseBodySchema,
	]>,
> =
{
	sendRequest: () => void;
	abortRequest: () => void;
	getResponse: () => Promise<z.output<ResponseBodySchema>>;
	tryGetResponse: () => Promise<z.output<ResponseBodySchema> | null>;
};

export function apiRequest
<
	RequestBodySchema extends z.ZodObject | z.ZodUnion<readonly
	[
		z.ZodObject,
		...z.ZodObject[],
	]>,
	ResponseBodySchema extends z.ZodUnion<readonly
	[
		typeof SuccessResponseBodySchema,
		typeof ErrorResponseBodySchema,
	]>,
>
(
	options: ApiRequestOptions<RequestBodySchema, ResponseBodySchema>,
): ApiRequestResult<ResponseBodySchema>
{
	const
	{
		baseUrl,
		schema:
		{
			method,
			path,
			ResponseBodySchema,
		},
		requestBody,
		onUploadProgress,
	} = options;

	const requestUrl = (baseUrl ?? "") + path;

	const xhr = new XMLHttpRequest();
	xhr.responseType = "json";
	xhr.withCredentials = true;

	const responseReady = new Promise<void>((resolve, reject) =>
	{
		xhr.onabort = () => reject(new XhrAbortedError());
		xhr.onerror = () => reject(new XhrErrorError());
		xhr.onload = () => resolve();
	});

	let sendRequest: () => void;

	const abortRequest = () =>
	{
		xhr.abort();
	};

	const getResponse = async () =>
	{
		if (xhr.readyState < 2)
		{
			sendRequest();
		}

		await responseReady;

		const responseBodyParseResult = ResponseBodySchema.safeParse(xhr.response);

		if (!responseBodyParseResult.success)
		{
			// HACK: could not figure out how to get rid of the error here 
			//	without casting after installing Zod 4
			return {
				success: false,
				errors:
				[
					{
						code: "INVALID_RESPONSE_BODY",
						message: "The response body did not match the expected schema.",
					},
				],
			} as z.output<typeof ResponseBodySchema>;
		}

		return responseBodyParseResult.data;
	};

	const tryGetResponse = async () =>
	{
		try
		{
			return getResponse();
		}
		catch (error)
		{
			return null;
		}
	}

	if (onUploadProgress != null)
	{
		xhr.upload.onprogress = onUploadProgress;
	}

	if (method == "GET")
	{
		const searchParameters = new URLSearchParams();

		searchParameters.set("requestBody", JSON.stringify(requestBody));

		xhr.open(method, requestUrl + "?" + searchParameters.toString());
	
		sendRequest = () =>
		{
			xhr.send();
		};
	}
	else
	{
		const hasFiles = Object.values(requestBody).some(value => value instanceof File);

		if (hasFiles)
		{
			const files: File[] = [];

			const json = JSON.stringify(requestBody,
				(_key, value) =>
				{
					if (value instanceof File)
					{
						const placeholder =
						{
							__file__: files.length,
						};

						files.push(value);

						return placeholder;
					}
					else
					{
						return value;
					}
				});

			const formData = new FormData();

			formData.set("requestBody", json);

			for (const [ fileIndex, file ] of files.entries())
			{
				formData.set("file" + fileIndex, file, file.name);
			}
				
			xhr.open(method, requestUrl);
	
			sendRequest = () =>
			{
				xhr.send(formData);
			};
		}
		else
		{	
			const json = JSON.stringify(requestBody);
				
			xhr.open(method, requestUrl);

			xhr.setRequestHeader("Content-Type", "application/json");
	
			sendRequest = () =>
			{
				xhr.send(json);
			};
		}
	}

	return {
		sendRequest,
		abortRequest,
		getResponse,
		tryGetResponse,
	};
}