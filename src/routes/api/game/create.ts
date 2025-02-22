//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { DateTime } from "luxon";
import { z } from "zod";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import * as SystemLib from "../../../libs/System.js";

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
			const game = await prismaClient.game.create(
				{
					data:
					{
						name: requestBody.name,
						sortName: requestBody.sortName,
						releaseDate: requestBody.releaseDate != null
							? DateTime.fromISO(requestBody.releaseDate).toJSDate()
							: null,
						description: requestBody.description,
						notes: requestBody.notes,
						progressionType: requestBody.progressionType,

						hasBannerImage: requestBody.hasBannerImage,
						hasCoverImage: requestBody.hasCoverImage,
						hasIconImage: requestBody.hasIconImage,
						hasLogoImage: requestBody.hasLogoImage,
						logoImageAlignment: requestBody.logoImageAlignment,
						logoImageJustification: requestBody.logoImageJustification,

						isEarlyAccess: requestBody.isEarlyAccess,
						isFamilyShared: requestBody.isFamilyShared,
						isFavorite: requestBody.isFavorite,
						isHidden: requestBody.isHidden,
						isInstalled: requestBody.isInstalled,
						isNsfw: requestBody.isNsfw,
						isShelved: requestBody.isShelved,
						isUnknownEngine: requestBody.isUnknownEngine,
						isUnreleased: requestBody.isUnreleased,

						purchaseDate: requestBody.purchaseDate != null
							? DateTime.fromISO(requestBody.purchaseDate).toJSDate()
							: null,
						completionStatus: requestBody.completionStatus,
						firstPlayedDate: requestBody.firstPlayedDate != null
							? DateTime.fromISO(requestBody.firstPlayedDate).toJSDate()
							: null,
						firstPlayedDateApproximated: requestBody.firstPlayedDateApproximated,
						firstCompletedDate: requestBody.firstCompletedDate != null
							? DateTime.fromISO(requestBody.firstCompletedDate).toJSDate()
							: null,
						firstCompletedDateApproximated: requestBody.firstCompletedDateApproximated,
						lastPlayedDate: requestBody.lastPlayedDate != null
							? DateTime.fromISO(requestBody.lastPlayedDate).toJSDate()
							: null,
						playCount: requestBody.playCount,
						playTimeTotalSeconds: requestBody.playTimeTotalSeconds,

						achievementSupport: requestBody.achievementSupport,
						controllerSupport: requestBody.controllerSupport,
						modSupport: requestBody.modSupport,
						virtualRealitySupport: requestBody.virtualRealitySupport,

						steamAppId: requestBody.steamAppId,
						steamAppName: requestBody.steamAppName,
						steamDeckCompatibility: requestBody.steamDeckCompatibility,
					},
				});

			if (game.isInstalled && game.steamAppId != null)
			{
				// HACK: This is to save me having to create one of these for each Steam game
				//	This should maybe be done somewhere else, or defined in a more generic way, idk
				await prismaClient.gamePlayAction.create(
					{
						data:
						{
							name: "Launch via Steam",
							type: "URL",
							path: "steam://rungameid/" + game.steamAppId,
							processRequirements: JSON.stringify(
								{
									requireEnvironmentVariables: true,
									environmentVariables:
									{
										"SteamGameId": game.steamAppId.toString(),
									},
								} satisfies z.input<typeof SystemLib.ProcessRequirementsSchema>),

							game_id: game.id,
						},
					});
			}

			return {
				success: true,
				game,
			};
		},
	});