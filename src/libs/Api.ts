//
// Imports
//

import fs from "node:fs";

import { BodyParserMiddleware, FritterFile, RouterMiddleware } from "@lorenstuff/fritter";
import { z } from "zod";

import
{
	ErrorResponseBody,
	ErrorResponseBodySchema,
	Message,
	SuccessResponseBodySchema,
} from "./Api.client.js";

//
// Classes
//

export class ApiError extends Error
{
	errors: Message[];
	statusCode: number;
	errorResponseBody: ErrorResponseBody;

	constructor(errorOrErrors: Message | Message[], statusCode = 400)
	{
		super("API Error");

		this.errors = Array.isArray(errorOrErrors) ? errorOrErrors : [ errorOrErrors ];
		this.statusCode = statusCode;
		this.errorResponseBody =
		{
			success: false,
			errors: this.errors,
		};
	}
}

//
// Locals
//

const FilePlaceholderSchema = z.object(
{
	__file__: z.number().min(0),
}).strict();

type ParseRequestBodyResult<RequestBody> =
{
	errorResponseBody: ErrorResponseBody;
	requestBody: null;
} |
{
	errorResponseBody: null;
	requestBody: RequestBody;
};

function parseRequestBody
<
	RequestBodySchema extends z.ZodObject | z.ZodUnion<readonly
	[
		z.ZodObject,
		...z.ZodObject[],
	]>,
>
(
	Schema: RequestBodySchema,
	rawRequestBody: unknown,
): ParseRequestBodyResult<z.infer<RequestBodySchema>>
{
	const requestBodyParseResult = Schema.safeParse(rawRequestBody);

	if (!requestBodyParseResult.success)
	{
		return {
			errorResponseBody:
			{
				success: false,
				errors: requestBodyParseResult.error.issues.map((issue) =>
				({
					code: issue.code,
					message: issue.path.join(" > ") + ": " + issue.message,
				})),
			},
			requestBody: null,
		};
	}
	else
	{
		return {
			errorResponseBody: null,
			// HACK: this cast is now needed in Zod 4 with the stricter RequestBodySchema type?
			requestBody: requestBodyParseResult.data as z.output<RequestBodySchema>,
		};
	}
}

//
// Utility Functions
//

export type CreateEndpointRouteOptions
<
	RouteFritterContext extends
	(
		RouterMiddleware.MiddlewareFritterContext & 
		BodyParserMiddleware.MiddlewareFritterContext
	),
	RequestBodySchema extends z.ZodObject | z.ZodUnion<readonly
	[
		z.ZodObject,
		...z.ZodObject[],
	]>,
	ResponseBodySchema extends z.ZodUnion<
	readonly [
		typeof SuccessResponseBodySchema,
		typeof ErrorResponseBodySchema,
	]>,
> =
{
	schema:
	{
		method: "GET" | "POST",
		path: RouterMiddleware.Route<RouteFritterContext>["path"];
		RequestBodySchema: RequestBodySchema;
		ResponseBodySchema: ResponseBodySchema;
	},
	middlewares: RouterMiddleware.Route<RouteFritterContext>["middlewares"];
	handler:
	(
		requestBody: z.infer<RequestBodySchema>,
		context: RouteFritterContext,
	) => Promise<z.infer<ResponseBodySchema>>;
};

export function createEndpointRoute
<
	RouteFritterContext extends
	(
		RouterMiddleware.MiddlewareFritterContext &
		BodyParserMiddleware.MiddlewareFritterContext
	),
	RequestBodySchema extends z.ZodObject | z.ZodUnion<readonly
	[
		z.ZodObject,
		...z.ZodObject[],
	]>,
	ResponseBodySchema extends z.ZodUnion<
	readonly [
		typeof SuccessResponseBodySchema,
		typeof ErrorResponseBodySchema,
	]>,
>
(
	options: CreateEndpointRouteOptions<RouteFritterContext, RequestBodySchema, ResponseBodySchema>
): RouterMiddleware.Route<RouteFritterContext>
{
	const
	{
		schema:
		{
			method,
			path,
			RequestBodySchema,
			ResponseBodySchema,
		},
		middlewares,
		handler,
	} = options;

	return {
		method,
		path,
		middlewares,
		handler: async (context) =>
		{
			context.fritterResponse.setContentType("applicaton/json");

			try
			{
				let rawRequestBody: BodyParserMiddleware.RequestBody;

				if (method == "GET")
				{
					try
					{
						rawRequestBody = JSON.parse(
							context.fritterRequest.getSearchParams().get("requestBody") ??
							"{}",
						);
					}
					catch (error)
					{
						rawRequestBody = {};
					}
				}
				else
				{
					const requestContentType = context.fritterRequest.getContentType();

					if (requestContentType == "application/json")
					{
						rawRequestBody = await context.getRequestBody();
					}
					else if (requestContentType == "multipart/form-data")
					{
						rawRequestBody = await context.getRequestBody();

						const rawRequestBodyJson = rawRequestBody["requestBody"];

						if (typeof rawRequestBodyJson == "string")
						{
							let fileIndex = 0;

							rawRequestBody = JSON.parse(rawRequestBodyJson, (_key, value) =>
							{
								const valueParseResult = FilePlaceholderSchema.safeParse(value);

								if (!valueParseResult.success)
								{
									// Note: Not a file placeholder object
									return value;
								}

								const file = rawRequestBody["file" + fileIndex]

								fileIndex += 1;

								if (!(file instanceof FritterFile))
								{
									return null;
								}

								// HACK: EVIL EVIL EVIL!
								const data = fs.readFileSync(file.path);

								return new File([ data ], file.fileName,
									{
										lastModified: file.modifiedDate.getTime(),
										type: file.mimeType,
									});
							});
						}
					}
					else
					{
						rawRequestBody = {};
					}
				}

				const
				{
					requestBody,
					errorResponseBody,
				} = parseRequestBody(RequestBodySchema, rawRequestBody);

				if (errorResponseBody != null)
				{
					context.fritterResponse.setBody(errorResponseBody);
					context.fritterResponse.setStatusCode(400);
		
					return;
				}

				const rawResponseBody = await handler(requestBody, context);

				const responseBody = ResponseBodySchema.parse(rawResponseBody);

				context.fritterResponse.setBody(responseBody);
			}
			catch (error)
			{
				if (error instanceof ApiError)
				{
					context.fritterResponse.setStatusCode(error.statusCode);

					return context.fritterResponse.setBody(error.errorResponseBody);
				}

				throw error;
			}
		},
	};
}