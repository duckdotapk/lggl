//
// Imports
//

import { DE } from "@donutteam/document-builder";
import * as Utilities from "@donutteam/utilities";
import { Prisma } from "@prisma/client";

import { GroupManager } from "../../classes/GroupManager.js";

import { Block } from "../../components/basic/Block.js";
import { Header } from "../../components/basic/Header.js";
import { Paragraph } from "../../components/basic/Paragraph.js";

import { GameSettingsToolbar } from "../../components/toolbar/GameSettingsToolbar.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as SettingModelLib from "../../libs/models/Setting.js";
import { DateTime } from "luxon";
import { shortEnglishHumanizer } from "../../instances/humanizer.js";
import { Label } from "../../components/input/Label.js";
import { ColumnLayout } from "../../components/layout/ColumnLayout.js";
import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";

//
// View
//

export type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: GroupManager<Prisma.GameGetPayload<{ include: { seriesGames: { include: { series: true } } } }>>;
	game: Prisma.GameGetPayload<null>;
	gamePlaySessions: Prisma.GamePlaySessionGetPayload<{ include: { gamePlayAction: true; platform: true } }>[];
	gamePlaySessionCount: number;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "games",
		pageTitle: "Play sessions | " + options.game.name + " | Games",
		content: ListLayout(
			{
				toolbar: GameSettingsToolbar(options.settings),
				groupManager: options.groupManager,
				createHref: "/games/create",
				content: Wrapper(
					[
						Breadcrumbs(
							[
								{ href: "/games", text: "Games" },
								{ href: "/games/view/" + options.game.id, text: options.game.name },
								{ href: "/gamePlaySessions/list/" + options.game.id, text: "Play sessions" },
							]),

						Header(1,
							[
								"Play sessions (",
								options.gamePlaySessionCount,
								")",
							]),

						Paragraph(
							[
								"You have ",
								new DE("b", null, Utilities.NumberLib.format(options.gamePlaySessionCount)),
								" play session",
								options.gamePlaySessionCount == 1 ? "" : "s",
								" recorded for this game.",
							]),

						// TODO: pagination

						options.gamePlaySessions.map(
							(gamePlaySession) =>
							{
								return Block(
									[
										Header(2, "Play session #" + gamePlaySession.id),

										ColumnLayout(3,
											[
												new DE("div", null,
													[
														Label(null, "Date"),
				
														Paragraph(
															[
																gamePlaySession.isHistorical
																	? "Historical"
																	: DateTime.fromJSDate(gamePlaySession.startDate).toLocaleString(DateTime.DATETIME_MED),
															]),
													]),

												new DE("div", null,
													[
														Label(null, "Platform"),
				
														Paragraph(
															[
																new DE("span", gamePlaySession.platform.iconName),
																" ",
																gamePlaySession.platform.name,
															]),
													]),

												new DE("div", null,
													[
														Label(null, "Play time"),
				
														Paragraph(shortEnglishHumanizer(gamePlaySession.playTimeSeconds * 1000)),
													]),
											]),
									]);
							}),
					]),
			}),
	};
}