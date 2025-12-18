//
// Imports
//

import { GameCompanyType, Prisma } from "@prisma/client";

//
// Constants
//

const typeNames: Record<GameCompanyType, string> =
{
	"DEVELOPER": "Developer",
	"PUBLISHER": "Publisher",
};

//
// Utility Functions
//

export function getGameCompanyTypeName
(
	gameCompanyOrType: Prisma.GameCompanyGetPayload<null> | GameCompanyType,
)
{
	return typeof gameCompanyOrType == "string"
		? typeNames[gameCompanyOrType]
		: typeNames[gameCompanyOrType.type];
}