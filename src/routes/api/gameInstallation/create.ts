//
// Imports
//

import fs from "node:fs";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import { ApiError, createEndpointRoute } from "../../../libs/Api.js";
import { getFolderSize, toGibiBytesAndBytes } from "../../../libs/FileSize.js";

import * as schema from "./create.schemas.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route = createEndpointRoute<RouteFritterContext, typeof schema.RequestBodySchema, typeof schema.ResponseBodySchema>(
{
	schema,
	middlewares: [],
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
			throw new ApiError(
			{
				code: "NOT_FOUND",
				message: "Game not found.",
			});
		}

		if (!fs.existsSync(requestBody.path))
		{
			throw new ApiError(
			{
				code: "INVALID_INPUT",
				message: "Full installation path does not exist.",
			});
		}

		const gameInstallationPathSize = await getFolderSize(requestBody.path);
		
		const
		[
			fileSizeGibiBytes,
			fileSizeBytes,
		] = toGibiBytesAndBytes(gameInstallationPathSize);

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