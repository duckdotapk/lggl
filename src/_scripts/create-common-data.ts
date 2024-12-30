//
// Imports
//

import { prismaClient } from "../_shared/instances/prismaClient.js";

//
// Functions
//

async function createAntiCheats()
{
	await prismaClient.antiCheat.createMany(
		{
			data:
			[
				{
					name: "None",
					sortOrder: -1,
				},
				{
					name: "BattlEye",
				},
				{
					name: "Denuvo Anti-cheat",
				},
				{
					name: "Easy Anti-Cheat",
				},
				{
					name: "Valve Anti-Cheat"
				}
			],
		});
}

async function createCompanies()
{
	await prismaClient.company.createMany(
		{
			data:
			[
				{
					name: "Unknown",
					sortOrder: -1,
				},
			],
		});
}

async function createDrms()
{
	await prismaClient.drm.createMany(
		{
			data:
			[
				{
					name: "None",
					sortOrder: -1,
				},
				{
					name: "Denuvo Anti-tamper",
				},
				{
					name: "Rockstar Games Launcher",
				},
				{
					name: "Steamworks DRM",
				},
			],
		});
}

async function createEngines()
{
	await prismaClient.engine.createMany(
		{
			data:
			[
				{
					name: "Unknown",
					sortOrder: -1,
				},

				{
					name: "Godot",
					sortOrder: 1,
				},
				{
					name: "Unity",
					sortOrder: 1,
				},
				{
					name: "Unreal",
					sortOrder: 1,
				},

				{
					name: "Dark",
				},
				{
					name: "Diesel",
				},
				{
					name: "Gamebryo",
				},
				{
					name: "GameMaker Studio",
				},
				{
					name: "Glacier",
				},
				{
					name: "GoldSrc",
				},
				{
					name: "id Tech",
				},
				{
					name: "Kex",
				},
				{
					name: "LÖVE",
				},
				{
					name: "mkxp",
				},
				{
					name: "PICO-8",
				},
				{
					name: "Pure3D",
				},
				{
					name: "Rockstar Advanced Game Engine",
					shortName: "RAGE",
				},
				{
					name: "REDengine",
				},
				{
					name: "Ren'Py",
				},
				{
					name: "RuneTek",
				},
				{
					name: "Source",
				},
				{
					name: "Telltale Tool",
				},
			],
		});
}

async function createGenres()
{
	await prismaClient.genre.createMany(
		{
			data:
			[
				{
					name: "Action",
				},
				{
					name: "Adventure",
				},
				{
					name: "Automation",
				},
				{
					name: "Battle Royale",
				},
				{
					name: "Board Game",
				},
				{
					name: "Casual",
				},
				{
					name: "Choices Matter",
				},
				{
					name: "City Builder",
				},
				{
					name: "Collectathon",
				},
				{
					name: "Cooking",
				},
				{
					name: "Crafting",
				},
				{
					name: "Creature Collector",
				},
				{
					name: "Dating",
				},
				{
					name: "Deckbuilder",
				},
				{
					name: "Driving",
				},
				{
					name: "Dungeon Crawler",
				},
				{
					name: "Educational",
				},
				{
					name: "Farming",
				},
				{
					name: "Fighting",
				},
				{
					name: "Fishing",
				},
				{
					name: "Hack and Slash",
				},
				{
					name: "Heisting",
				},
				{
					name: "Horror",
				},
				{
					name: "Idle",
				},
				{
					name: "Interactive Fiction",
				},
				{
					name: "Management",
				},
				{
					name: "Mining",
				},
				{
					name: "MMO",
				},
				{
					name: "Music",
				},
				{
					name: "Open World",
				},
				{
					name: "Parkour",
				},
				{
					name: "Party",
				},
				{
					name: "Platformer (2D)",
				},
				{
					name: "Platformer (3D)",
				},
				{
					name: "Point & Click",
				},
				{
					name: "Puzzle",
				},
				{
					name: "Racing",
				},
				{
					name: "Rhythm",
				},
				{
					name: "Rogue-like",
				},
				{
					name: "Romance",
				},
				{
					name: "RPG",
				},
				{
					name: "Sandbox",
				},
				{
					name: "Shooter (First Person)",
				},
				{
					name: "Shooter (Third Person)",
				},
				{
					name: "Shooter (Top Down)",
				},
				{
					name: "Simulation",
				},
				{
					name: "Skateboarding",
				},
				{
					name: "Social Deduction",
				},
				{
					name: "Sports",
				},
				{
					name: "Stealth",
				},
				{
					name: "Strategy",
				},
				{
					name: "Superhero",
				},
				{
					name: "Surreal",
				},
				{
					name: "Survival",
				},
				{
					name: "Tower Defense",
				},
				{
					name: "Visual Novel",
				},
				{
					name: "Walking Simulator",
				},
				{
					name: "Zombies",
				},
			],
		});
}

async function createModes()
{
	await prismaClient.mode.createMany(
		{
			data:
			[
				{
					name: "Co-op",
					isMultiplayer: true,
					isOnline: false,
				},
				{
					name: "Co-op",
					isMultiplayer: true,
					isOnline: true,
				},

				{
					name: "PvP",
					isMultiplayer: true,
					isOnline: false,
				},
				{
					name: "PvP",
					isMultiplayer: true,
					isOnline: true,
				},

				{
					name: "Social",
					isMultiplayer: true,
					isOnline: false,
				},
				{
					name: "Social",
					isMultiplayer: true,
					isOnline: true,
				},

				{
					name: "Singleplayer",
					isMultiplayer: false,
					isOnline: false,
				},
			],
		});
}

async function createPlatforms()
{
	await prismaClient.platform.createMany(
		{
			data:
			[
				{
					name: "PC",
				},
				{
					name: "Nintendo DS",
				},
				{
					name: "Nintendo Game Boy Advanced",
				},
				{
					name: "Nintendo Switch",
				},
				{
					name: "Super Nintendo Entertainment System",
				},
			],
		});
}

async function createRatingBoards()
{
	const ratingBoard = await prismaClient.ratingBoard.create(
		{
			data:
			{
				name: "Entertainment Software Rating Board",
				shortName: "ESRB",
			},
		});

	await prismaClient.ratingBoardRating.createMany(
		{
			data:
			[
				{
					sortOrder: 0,

					name: "Everyone",
					shortName: "E",

					ratingBoard_id: ratingBoard.id,
				},
				{
					sortOrder: 1,

					name: "Everyone 10+",
					shortName: "E10+",

					ratingBoard_id: ratingBoard.id,
				},
				{
					sortOrder: 2,

					name: "Teen",
					shortName: "T",

					ratingBoard_id: ratingBoard.id,
				},
				{
					sortOrder: 3,

					name: "Mature",
					shortName: "M",

					ratingBoard_id: ratingBoard.id,
				},
				{
					sortOrder: 4,

					name: "Adults Only",
					shortName: "AO",

					ratingBoard_id: ratingBoard.id,
				},
			],
		});
}

async function createSeries()
{
	await prismaClient.series.createMany(
		{
			data:
			[
				{
					name: "None",
					sortOrder: -1,
				},
			],
		});
}

async function createSources()
{
	await prismaClient.source.createMany(
		{
			data:
			[
				{
					name: "Unknown",
					sortOrder: -1,
				},

				{
					name: "Cartridge Dump",
				},
				{
					name: "Compact Discs",
				},
				{
					name: "Steam",
				},
				{
					name: "Website",
				},
			],
		});
}

async function main()
{
	await createAntiCheats();

	await createCompanies();

	await createDrms();

	await createEngines();

	await createGenres();

	await createModes();

	await createPlatforms();

	await createRatingBoards();

	await createSeries();

	await createSources();
}

//
// Scripts
//

await main();