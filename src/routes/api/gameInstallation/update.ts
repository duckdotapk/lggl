//
// Imports
//

import fs from "node:fs";
import path from "node:path";

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { Prisma } from "@prisma/client";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import * as FileSizeLib from "../../../libs/FileSize.js";

import * as Schemas from "./update.schemas.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route = FritterApiUtilities.createEndpointRoute<RouteFritterContext, typeof Schemas.RequestBodySchema, typeof Schemas.ResponseBodySchema>(
	{
		method: Schemas.method,
		path: Schemas.path,
		middlewares: [],
		requestBodySchema: Schemas.RequestBodySchema,
		responseBodySchema: Schemas.ResponseBodySchema,
		handler: async (requestBody) =>
		{
			const gameInstallation = await prismaClient.gameInstallation.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (gameInstallation == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "GameInstallation not found." });
			}

			const directory = await prismaClient.directory.findUnique(
				{
					where:
					{
						id: requestBody.updateData.directory_id ?? gameInstallation.directory_id,
					},
				});

			if (directory == null)
			{
				throw new FritterApiUtilities.APIError({ code: "INVALID_INPUT", message: "Directory not found." });
			}

			const gameInstallationUpdateData: Prisma.GameInstallationUpdateArgs["data"] = {};

			if (requestBody.updateData.path !== undefined)
			{
				const gameInstallationFullPath = path.normalize(path.join(directory.path, requestBody.updateData.path));

				if (!fs.existsSync(gameInstallationFullPath))
				{
					throw new FritterApiUtilities.APIError({ code: "INVALID_INPUT", message: "Full path does not exist." });
				}

				const gameInstallationPathSize = await FileSizeLib.getFolderSize(gameInstallationFullPath);
				
				const [ fileSizeGibiBytes, fileSizeBytes ] = FileSizeLib.toGibiBytesAndBytes(gameInstallationPathSize);

				gameInstallationUpdateData.path = requestBody.updateData.path;
				gameInstallationUpdateData.fileSizeGibiBytes = fileSizeGibiBytes;
				gameInstallationUpdateData.fileSizeBytes = fileSizeBytes;
			}

			if (requestBody.updateData.directory_id !== undefined)
			{
				gameInstallationUpdateData.directory_id = requestBody.updateData.directory_id;
			}

			if (Object.keys(gameInstallationUpdateData).length == 0)
			{
				return {
					success: true,
				};
			}

			await prismaClient.gameInstallation.update(
				{
					where:
					{
						id: gameInstallation.id,
					},
					data: gameInstallationUpdateData,
				});

			return {
				success: true,
			};
		},
	});