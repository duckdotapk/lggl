//
// Imports
//

import readline from "node:readline";

import { prismaClient } from "../../instances/prismaClient.js";

import * as EngineCliLib from "./Engine.js";
import * as GameCliLib from "./Game.js";

//
// Utility Functions
//

export async function create(readlineInterface: readline.promises.Interface)
{
	const games = await GameCliLib.search(readlineInterface);

	const game = await GameCliLib.choose(readlineInterface, games);

	const engines = await EngineCliLib.search(readlineInterface);

	const engine = await EngineCliLib.choose(readlineInterface, engines);

	return await prismaClient.gameEngine.create(
		{
			data:
			{
				engine_id: engine.id,
				game_id: game.id,
			},
		});
}