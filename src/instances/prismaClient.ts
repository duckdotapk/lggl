//
// Imports
//

import { PrismaClient } from "@prisma/client";

import { LGGL_DATABASE_URL } from "../env/LGGL_DATABASE_URL.js";

//
// Exports
//

export const prismaClient = new PrismaClient(
{
	datasourceUrl: LGGL_DATABASE_URL,
});