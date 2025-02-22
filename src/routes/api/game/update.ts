//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

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
			const game = await prismaClient.game.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (game == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Game not found." });
			}

			const gameUpdateData: Prisma.GameUpdateArgs["data"] = {};

			if (requestBody.updateData.name !== undefined)
			{
				gameUpdateData.name = requestBody.updateData.name;
			}

			if (requestBody.updateData.sortName !== undefined)
			{
				gameUpdateData.sortName = requestBody.updateData.sortName;
			}

			if (requestBody.updateData.releaseDate !== undefined)
			{
				gameUpdateData.releaseDate = requestBody.updateData.releaseDate !== null
					? DateTime.fromISO(requestBody.updateData.releaseDate).toJSDate()
					: null;
			}

			if (requestBody.updateData.description !== undefined)
			{
				gameUpdateData.description = requestBody.updateData.description;
			}

			if (requestBody.updateData.notes !== undefined)
			{
				gameUpdateData.notes = requestBody.updateData.notes;
			}

			if (requestBody.updateData.progressionType !== undefined)
			{
				gameUpdateData.progressionType = requestBody.updateData.progressionType;
			}

			if (requestBody.updateData.hasBannerImage !== undefined)
			{
				gameUpdateData.hasBannerImage = requestBody.updateData.hasBannerImage;
			}

			if (requestBody.updateData.hasCoverImage !== undefined)
			{
				gameUpdateData.hasCoverImage = requestBody.updateData.hasCoverImage;
			}

			if (requestBody.updateData.hasIconImage !== undefined)
			{
				gameUpdateData.hasIconImage = requestBody.updateData.hasIconImage;
			}

			if (requestBody.updateData.hasLogoImage !== undefined)
			{
				gameUpdateData.hasLogoImage = requestBody.updateData.hasLogoImage;
			}

			if (requestBody.updateData.logoImageAlignment !== undefined)
			{
				gameUpdateData.logoImageAlignment = requestBody.updateData.logoImageAlignment;
			}

			if (requestBody.updateData.logoImageJustification !== undefined)
			{
				gameUpdateData.logoImageJustification = requestBody.updateData.logoImageJustification;
			}

			if (requestBody.updateData.isEarlyAccess !== undefined)
			{
				gameUpdateData.isEarlyAccess = requestBody.updateData.isEarlyAccess;
			}

			if (requestBody.updateData.isFamilyShared !== undefined)
			{
				gameUpdateData.isFamilyShared = requestBody.updateData.isFamilyShared;
			}

			if (requestBody.updateData.isFavorite !== undefined)
			{
				gameUpdateData.isFavorite = requestBody.updateData.isFavorite;
			}

			if (requestBody.updateData.isHidden !== undefined)
			{
				gameUpdateData.isHidden = requestBody.updateData.isHidden;
			}

			if (requestBody.updateData.isInstalled !== undefined)
			{
				gameUpdateData.isInstalled = requestBody.updateData.isInstalled;
			}

			if (requestBody.updateData.isNsfw !== undefined)
			{
				gameUpdateData.isNsfw = requestBody.updateData.isNsfw;
			}

			if (requestBody.updateData.isShelved !== undefined)
			{
				gameUpdateData.isShelved = requestBody.updateData.isShelved;
			}

			if (requestBody.updateData.isUnknownEngine !== undefined)
			{
				gameUpdateData.isUnknownEngine = requestBody.updateData.isUnknownEngine;
			}

			if (requestBody.updateData.isUnreleased !== undefined)
			{
				gameUpdateData.isUnreleased = requestBody.updateData.isUnreleased;
			}

			if (requestBody.updateData.purchaseDate !== undefined)
			{
				gameUpdateData.purchaseDate = requestBody.updateData.purchaseDate !== null
					? DateTime.fromISO(requestBody.updateData.purchaseDate).toJSDate()
					: null;	
			}

			if (requestBody.updateData.completionStatus !== undefined)
			{
				gameUpdateData.completionStatus = requestBody.updateData.completionStatus;
			}

			if (requestBody.updateData.firstPlayedDate !== undefined)
			{
				gameUpdateData.firstPlayedDate = requestBody.updateData.firstPlayedDate !== null
					? DateTime.fromISO(requestBody.updateData.firstPlayedDate).toJSDate()
					: null;
			}

			if (requestBody.updateData.firstPlayedDateApproximated !== undefined)
			{
				gameUpdateData.firstPlayedDateApproximated = requestBody.updateData.firstPlayedDateApproximated;
			}

			if (requestBody.updateData.firstCompletedDate !== undefined)
			{
				gameUpdateData.firstCompletedDate = requestBody.updateData.firstCompletedDate !== null
					? DateTime.fromISO(requestBody.updateData.firstCompletedDate).toJSDate()
					: null;
			}

			if (requestBody.updateData.firstCompletedDateApproximated !== undefined)
			{
				gameUpdateData.firstCompletedDateApproximated = requestBody.updateData.firstCompletedDateApproximated;
			}

			if (requestBody.updateData.lastPlayedDate !== undefined)
			{
				gameUpdateData.lastPlayedDate = requestBody.updateData.lastPlayedDate !== null
					? DateTime.fromISO(requestBody.updateData.lastPlayedDate).toJSDate()
					: null;
			}

			if (requestBody.updateData.playCount !== undefined)
			{
				gameUpdateData.playCount = requestBody.updateData.playCount;
			}

			if (requestBody.updateData.playTimeTotalSeconds !== undefined)
			{
				gameUpdateData.playTimeTotalSeconds = requestBody.updateData.playTimeTotalSeconds;
			}

			if (requestBody.updateData.achievementSupport !== undefined)
			{
				gameUpdateData.achievementSupport = requestBody.updateData.achievementSupport;
			}

			if (requestBody.updateData.controllerSupport !== undefined)
			{
				gameUpdateData.controllerSupport = requestBody.updateData.controllerSupport;
			}

			if (requestBody.updateData.modSupport !== undefined)
			{
				gameUpdateData.modSupport = requestBody.updateData.modSupport;
			}

			if (requestBody.updateData.virtualRealitySupport !== undefined)
			{
				gameUpdateData.virtualRealitySupport = requestBody.updateData.virtualRealitySupport;
			}

			if (requestBody.updateData.steamAppId !== undefined)
			{
				gameUpdateData.steamAppId = requestBody.updateData.steamAppId;
			}

			if (requestBody.updateData.steamAppName !== undefined)
			{
				gameUpdateData.steamAppName = requestBody.updateData.steamAppName;
			}

			if (requestBody.updateData.steamDeckCompatibility !== undefined)
			{
				gameUpdateData.steamDeckCompatibility = requestBody.updateData.steamDeckCompatibility;
			}

			if (Object.keys(gameUpdateData).length == 0)
			{
				return {
					success: true,
				};
			}

			await prismaClient.game.update(
				{
					where:
					{
						id: game.id,
					},
					data: gameUpdateData,
				});

			return {
				success: true,
			};
		},
	});