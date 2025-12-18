//
// Imports
//

import fs from "node:fs";

import { Prisma } from "@prisma/client";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import { ApiError, createEndpointRoute } from "../../../libs/Api.js";
import { getFolderSize, toGibiBytesAndBytes } from "../../../libs/FileSize.js";

import * as schema from "./update.schemas.js";

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
		const gameInstallation = await prismaClient.gameInstallation.findUnique(
		{
			where:
			{
				id: requestBody.id,
			},
		});

		if (gameInstallation == null)
		{
			throw new ApiError(
			{
				code: "NOT_FOUND",
				message: "GameInstallation not found.",
			});
		}

		const gameInstallationUpdateData: Prisma.GameInstallationUpdateArgs["data"] = {};

		if (requestBody.updateData.path !== undefined)
		{
			if (!fs.existsSync(requestBody.updateData.path))
			{
				throw new ApiError(
				{
					code: "INVALID_INPUT",
					message: "Full path does not exist.",
				});
			}

			const gameInstallationPathSize = await getFolderSize(requestBody.updateData.path);
			
			const
			[
				fileSizeGibiBytes,
				fileSizeBytes,
			] = toGibiBytesAndBytes(gameInstallationPathSize);

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