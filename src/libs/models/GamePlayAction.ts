//
// Imports
//

import { Prisma } from "@prisma/client";

import * as GamePlayActionSchemaLib from "../schemas/GamePlayAction.js";

//
// Constants
//

const typeNames: Record<GamePlayActionSchemaLib.Type, string> =
{
	"EXECUTABLE": "Executable",
	"URL": "URL",
};

//
// Utility Functions
//

export function getTypeName(gamePlayActionOrType: Prisma.GameCompanyGetPayload<null> | GamePlayActionSchemaLib.Type)
{
	if (typeof gamePlayActionOrType == "string")
	{
		return typeNames[gamePlayActionOrType];
	}

	if (gamePlayActionOrType.type == null)
	{
		return "-";
	}

	const typeParseResult = GamePlayActionSchemaLib.TypeSchema.safeParse(gamePlayActionOrType.type);

	return typeParseResult.success
		? typeNames[typeParseResult.data]
		: "Invalid: " + gamePlayActionOrType.type;
}