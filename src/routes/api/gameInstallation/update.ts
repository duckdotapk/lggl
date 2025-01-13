//
// Imports
//

import fs from "node:fs";

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

			const gameInstallationUpdateData: Prisma.GameInstallationUpdateArgs["data"] = {};

			if (requestBody.updateData.path !== undefined)
			{
				if (!fs.existsSync(requestBody.updateData.path))
				{
					throw new FritterApiUtilities.APIError({ code: "INVALID_INPUT", message: "Path does not exist." });
				}

				const gameInstallationPathSize = await FileSizeLib.getFolderSize(requestBody.updateData.path);
				
				const [ fileSizeGibiBytes, fileSizeBytes ] = FileSizeLib.toGibiBytesAndBytes(gameInstallationPathSize);

				gameInstallationUpdateData.path = requestBody.updateData.path;
				gameInstallationUpdateData.fileSizeGibiBytes = fileSizeGibiBytes;
				gameInstallationUpdateData.fileSizeBytes = fileSizeBytes;
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