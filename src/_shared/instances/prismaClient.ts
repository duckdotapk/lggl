//
// Imports
//

import { PrismaClient } from "@prisma/client";

import { configuration } from "../libs/Configuration.js";

//
// Exports
//

export const prismaClient = new PrismaClient(
	{
		datasourceUrl: configuration.databaseUrl,
	});