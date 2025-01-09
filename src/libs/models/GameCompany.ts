//
// Imports
//

import { Prisma } from "@prisma/client";

import * as GameCompanySchemaLib from "../schemas/GameCompany.js";

//
// Constants
//

const typeNames: Record<GameCompanySchemaLib.Type, string> =
{
	"DEVELOPER": "Developer",
	"PUBLISHER": "Publisher",
};

//
// Utility Functions
//

export function getTypeName(gameCompanyOrType: Prisma.GameCompanyGetPayload<null> | GameCompanySchemaLib.Type)
{
	if (typeof gameCompanyOrType == "string")
	{
		return typeNames[gameCompanyOrType];
	}

	if (gameCompanyOrType.type == null)
	{
		return "-";
	}

	const typeParseResult = GameCompanySchemaLib.TypeSchema.safeParse(gameCompanyOrType.type);

	return typeParseResult.success
		? typeNames[typeParseResult.data]
		: "Invalid: " + gameCompanyOrType.type;
}