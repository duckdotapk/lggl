//
// Imports
//

import fs from "node:fs";
import path from "node:path";

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import * as FileSizeLib from "../../../libs/FileSize.js";

import * as Schemas from "./create.schemas.js";

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
			const game = await prismaClient.game.findUnique(
				{
					where:
					{
						id: requestBody.game_id,
					},
				});

			if (game == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Game not found." });
			}

			let directory = await prismaClient.directory.findUnique(
				{
					where:
					{
						id: requestBody.directory_id,
					},
				});

			if (directory == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Directory not found." });
			}

			const gameInstallationFullPath = path.normalize(path.join(directory.path, requestBody.path));

			if (!fs.existsSync(gameInstallationFullPath))
			{
				throw new FritterApiUtilities.APIError({ code: "INVALID_INPUT", message: "Full installation path does not exist." });
			}

			const gameInstallationPathSize = await FileSizeLib.getFolderSize(gameInstallationFullPath);
			
			const [ fileSizeGibiBytes, fileSizeBytes ] = FileSizeLib.toGibiBytesAndBytes(gameInstallationPathSize);

			await prismaClient.gameInstallation.create(
				{
					data:
					{
						path: requestBody.path,
						fileSizeGibiBytes,
						fileSizeBytes,

						directory_id: directory.id,
						game_id: game.id,
					},
				});

			return {
				success: true,
			};
		},
	});