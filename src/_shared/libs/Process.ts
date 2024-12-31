//
// Imports
//

import { configuration } from "./Configuration.js";

//
// Constants
//

// TODO: determine this at startup
const isSteamDeck = false;

//
// Utility Functions
//

export function determinePlatformId()
{
	if (isSteamDeck)
	{
		return configuration.processPlatformIdMap.steamDeck;
	}

	switch (process.platform)
	{
		case "win32":
			return configuration.processPlatformIdMap.windows;

		case "darwin":
			return configuration.processPlatformIdMap.mac;

		case "linux":
			return configuration.processPlatformIdMap.linux;

		default:
			return configuration.processPlatformIdMap.unknown;
	}
}