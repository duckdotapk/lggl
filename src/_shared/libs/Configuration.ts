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
		steamApiKey: z.string(),
		steamUserId: z.string(),
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