//
// Imports
//

import
{
	GameCompanyType,
	Prisma,
} from "@prisma/client";

import z from "zod";

//
// Locals
//

type GameCompany = Pick<Prisma.GameCompanyGetPayload<null>, keyof Prisma.GameCompanyFieldRefs>;

type GameCompanyField<T extends keyof GameCompany> = z.ZodType<GameCompany[T], z.ZodType, any>;

//
// Schemas
//

export const GameCompanyTypeSchema =  z.enum(
[
	"DEVELOPER" satisfies GameCompanyType,
	"PUBLISHER" satisfies GameCompanyType,
]) satisfies GameCompanyField<"type">;