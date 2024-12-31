//
// Imports
//

import fs from "node:fs";

import yaml from "yaml";
import { z } from "zod";

//
// Schemas
//

export const ConfigurationSchema = z.object(
	{
		databaseUrl: z.string().url(),
		steamApiKey: z.string(),
		steamUserId: z.string(),
		processPlatformIdMap: z.object(
			{
				windows: z.number(),
				mac: z.number(),
				linux: z.number(),
				steamDeck: z.number(),
				unknown: z.number(),
			}),
	});

//
// Types
//

export type Configuration = z.infer<typeof ConfigurationSchema>;

//
// Constants
//

export const rawConfiguration = await fs.promises.readFile("./configuration.yaml", "utf8");

export const configuration: Configuration = ConfigurationSchema.parse(yaml.parse(rawConfiguration));