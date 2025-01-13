//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";

import { LGGL_STEAM_API_KEY } from "../../../env/LGGL_STEAM_API_KEY.js";
import { LGGL_STEAM_USER_ID } from "../../../env/LGGL_STEAM_USER_ID.js";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import * as SteamThirdPartyLib from "../../../libs/third-party/Steam.js";

import * as NetworkLib from "../../../libs/Network.js";

import * as Schemas from "./downloadImages.schemas.js";

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

			switch (requestBody.provider.name)
			{
				case "steam":
				{
					const imageUrls = await SteamThirdPartyLib.fetchImageUrls(LGGL_STEAM_API_KEY, LGGL_STEAM_USER_ID, requestBody.provider.steamAppId);
		
					const bannerDownloaded = await NetworkLib.downloadUrl(imageUrls.libraryBackground, [ "images", "games", game.id.toString(), "banner.jpg" ]);
				
					const coverDownloaded = await NetworkLib.downloadUrl(imageUrls.libraryCapsule, [ "images", "games", game.id.toString(), "cover.jpg" ]);
				
					const iconDownloaded = imageUrls.icon != null 
						? await NetworkLib.downloadUrl(imageUrls.icon, [ "images", "games", game.id.toString(), "icon.jpg" ])
						: false;
				
					const logoDownloaded = await NetworkLib.downloadUrl(imageUrls.libraryLogo, [ "images", "games", game.id.toString(), "logo.png" ]);
				
					await prismaClient.game.update(
						{
							where:
							{
								id: game.id,
							},
							data:
							{
								hasBannerImage: bannerDownloaded,
								hasCoverImage: coverDownloaded,
								hasIconImage: iconDownloaded,
								hasLogoImage: logoDownloaded,
							},
						});
					
					break;
				}
			}

			return {
				success: true,
			};
		},
	});