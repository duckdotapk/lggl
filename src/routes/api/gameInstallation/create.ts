//
// Imports
//

import fs from "node:fs";

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

			if (!fs.existsSync(requestBody.path))
			{
				throw new FritterApiUtilities.APIError({ code: "INVALID_INPUT", message: "Full installation path does not exist." });
			}

			const gameInstallationPathSize = await FileSizeLib.getFolderSize(requestBody.path);
			
			const [ fileSizeGibiBytes, fileSizeBytes ] = FileSizeLib.toGibiBytesAndBytes(gameInstallationPathSize);

			await prismaClient.gameInstallation.create(
				{
					data:
					{
						path: requestBody.path,
						fileSizeGibiBytes,
						fileSizeBytes,

						game_id: game.id,
					},
				});

			return {
				success: true,
			};
		},
	});