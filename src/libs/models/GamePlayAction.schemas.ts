//
// Imports
//

import
{
	GamePlayActionType,
	Prisma,
} from "@prisma/client";

import z from "zod";

//
// Locals
//

type GamePlayAction = Pick<Prisma.GamePlayActionGetPayload<null>, keyof Prisma.GamePlayActionFieldRefs>;

type GamePlayActionField<T extends keyof GamePlayAction> = z.ZodType<GamePlayAction[T], z.ZodType, any>;

//
// Schemas
//

export const GamePlayActionTypeSchema =  z.enum(
[
	"EXECUTABLE" satisfies GamePlayActionType,
	"URL" satisfies GamePlayActionType,
]) satisfies GamePlayActionField<"type">;