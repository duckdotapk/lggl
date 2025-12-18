//
// Imports
//

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import { fetchSteamImageUrls } from "../../../libs/third-party/Steam.js";

import { ApiError, createEndpointRoute } from "../../../libs/Api.js";
import { downloadUrl } from "../../../libs/Network.js";

import * as schema from "./downloadImages.schemas.js";

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
				id: requestBody.id,
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

		switch (requestBody.provider.name)
		{
			case "steam":
			{
				const imageUrls = await fetchSteamImageUrls(requestBody.provider.steamAppId);
	
				const bannerDownloaded = await downloadUrl(
					imageUrls.libraryBackground,
					[ "images", "games", game.id.toString(), "banner.jpg" ],
				);
			
				const coverDownloaded = await downloadUrl(
					imageUrls.libraryCapsule,
					[ "images", "games", game.id.toString(), "cover.jpg" ],
				);
			
				const iconDownloaded = await downloadUrl(
					imageUrls.icon,
					[ "images", "games", game.id.toString(), "icon.jpg" ],
				);
			
				const logoDownloaded = await downloadUrl(
					imageUrls.libraryLogo,
					[ "images", "games", game.id.toString(), "logo.png" ],
				);
			
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