//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { Block } from "../basic/Block.js";

import { Button } from "../input/Button.js";
import { Checkbox } from "../input/Checkbox.js";
import { Control } from "../input/Control.js";
import { Label } from "../input/Label.js";
import { TabControl } from "../input/TabControl.js";

import { ColumnLayout } from "../layout/ColumnLayout.js";

import * as GameModelLib from "../../libs/models/Game.js";

import * as GameSchemaLib from "../../libs/schemas/Game.js";

//
// Component
//

export type UpsertGameFormGame = Prisma.GameGetPayload<null> | null;

export function UpsertGameForm(game: UpsertGameFormGame)
{
	return new DE("form",
		{
			class: "component-upsert-game-form",
			autocomplete: "off",

			"data-game-id": game?.id ?? null,
		},
		[
			TabControl(
				[
					{
						title: "General data",
						content: Block(
							[
								ColumnLayout(2,
									[
										new DE("div", null,
											[
												Label("name", "Name"),
									
												Control(
													{ 
														type: "text", 
														name: "name", 
														required: true, 
														value: game?.name, 
														placeholder: "Name",
													}),
											]),

										new DE("div", null,
											[
												Label("sortName", "Sort name"),
					
												Control(
													{ 
														type: "text", 
														name: "sortName", 
														required: true,
														value: game?.sortName ?? null, 
														placeholder: "Sort name",
													}),
											]),

										new DE("div", null,
											[
												Label("releaseDate", "Release date"),
									
												Control(
													{ 
														type: "date", 
														name: "releaseDate", 
														required: false,
														value: game?.releaseDate != null 
															? DateTime.fromJSDate(game.releaseDate) 
															: null,
													}),
											]),
											
										new DE("div", null,
											[
												Label("progressionType", "Progression type"),
									
												Control(
													{
														type: "select",
														name: "progressionType",
														required: false,
														value: game?.progressionType ?? null,
														showEmptyOption: true,
														options: GameSchemaLib.ProgressionTypeSchema.options.map((option) => ({ value: option, label: GameModelLib.getProgressionTypeName(option) }))
													}),
											]),
									]),
					
								Label("description", "Description"),
					
								Control(
									{ 
										type: "textarea", 
										name: "description", 
										required: false,
										value: game?.description ?? null, 
										placeholder: "Description",
									}),
					
								Label("notes", "Notes"),
					
								Control(
									{ 
										type: "textarea", 
										name: "notes", 
										required: false,
										value: game?.notes ?? null, 
										placeholder: "Notes",
									}),
							]),
					},
					{
						title: "Image flags",
						content: Block(
							[
								Checkbox("hasBannerImage", "Has banner image", game?.hasBannerImage ?? false),
					
								Checkbox("hasCoverImage", "Has cover image", game?.hasCoverImage ?? false),
					
								Checkbox("hasIconImage", "Has icon image", game?.hasIconImage ?? false),
					
								Checkbox("hasLogoImage", "Has logo image", game?.hasLogoImage ?? false),
							]),
					},
					{
						title: "Other flags",
						content: Block(
							[
								Checkbox("isEarlyAccess", "Is early access", game?.isEarlyAccess ?? false),
					
								Checkbox("isFavorite", "Is favorite", game?.isFavorite ?? false),
					
								Checkbox("isHidden", "Is hidden", game?.isHidden ?? false),
					
								Checkbox("isInstalled", "Is installed", game?.isInstalled ?? false),
					
								Checkbox("isNsfw", "Is NSFW", game?.isNsfw ?? false),
					
								Checkbox("isShelved", "Is shelved", game?.isShelved ?? false),
					
								Checkbox("isUnknownEngine", "Is unknown engine", game?.isUnknownEngine ?? false),
					
								Checkbox("isUnreleased", "Is unreleased", game?.isUnreleased ?? false),
							]),
					},
					{
						title: "Play data",
						content: Block(
							[
								Label("completionStatus", "Completion status"),
					
								Control(
									{
										type: "select",
										name: "completionStatus",
										required: false,
										value: game?.completionStatus ?? null,
										showEmptyOption: true,
										options: GameSchemaLib.CompletionStatusSchema.options.map((option) => ({ value: option, label: GameModelLib.getCompletionStatusName(option) }))
									}),
					
								Label("firstPlayedDate", "First played date"),
					
								Control(
									{ 
										type: "datetime", 
										name: "firstPlayedDate", 
										required: false,
										value: game?.firstPlayedDate != null 
											? DateTime.fromJSDate(game.firstPlayedDate) 
											: null,
									}),
					
								Checkbox("firstPlayedDateApproximated", "Is approximated", game?.firstPlayedDateApproximated ?? false),
					
								Label("firstCompletedDate", "First completed date"),
					
								Control(
									{
										type: "datetime",
										name: "firstCompletedDate",
										required: false,
										value: game?.firstCompletedDate != null
											? DateTime.fromJSDate(game.firstCompletedDate)
											: null,
									}),
					
								Checkbox("firstCompletedDateApproximated", "Is approximated", game?.firstCompletedDateApproximated ?? false),
					
								Label("lastPlayedDate", "Last played date"),
					
								Control(
									{
										type: "datetime",
										name: "lastPlayedDate",
										required: false,
										value: game?.lastPlayedDate != null
											? DateTime.fromJSDate(game.lastPlayedDate)
											: null,
									}),
					
								Label("playCount", "Play count"),
					
								Control(
									{
										type: "number",
										name: "playCount",
										required: false,
										value: game?.playCount ?? null,
									}),
					
								Label("playTimeTotalSeconds", "Play time (in seconds)"),
					
								Control(
									{
										type: "number",
										name: "playTimeTotalSeconds",
										required: false,
										value: game?.playTimeTotalSeconds ?? null,
									}),
							]),
					},
					{
						title: "Supported features",
						content: Block(
							[
								Label("achievementSupport", "Achievement support"),
					
								Control(
									{
										type: "select",
										name: "achievementSupport",
										required: false,
										value: game?.achievementSupport ?? null,
										showEmptyOption: true,
										options: GameSchemaLib.AchievementSupportSchema.options.map((option) => ({ value: option, label: GameModelLib.getAchievementSupportName(option) }))
									}),
					
								Label("controllerSupport", "Controller support"),
					
								Control(
									{
										type: "select",
										name: "controllerSupport",
										required: false,
										value: game?.controllerSupport ?? null,
										showEmptyOption: true,
										options: GameSchemaLib.ControllerSupportSchema.options.map((option) => ({ value: option, label: GameModelLib.getControllerSupportName(option) }))
									}),
					
								Label("modSupport", "Mod support"),
					
								Control(
									{
										type: "select",
										name: "modSupport",
										required: false,
										value: game?.modSupport ?? null,
										showEmptyOption: true,
										options: GameSchemaLib.ModSupportSchema.options.map((option) => ({ value: option, label: GameModelLib.getModSupportName(option) }))
									}),
					
								Label("virtualRealitySupport", "Virtual reality support"),
					
								Control(
									{
										type: "select",
										name: "virtualRealitySupport",
										required: false,
										value: game?.virtualRealitySupport ?? null,
										showEmptyOption: true,
										options: GameSchemaLib.VirtualRealitySupportSchema.options.map((option) => ({ value: option, label: GameModelLib.getVirtualRealitySupportName(option) }))
									}),
							]),
					},
					{
						title: "Steam data",
						content: Block(
							[
								Label("steamAppId", "Steam app ID"),
					
								Control(
									{
										type: "number",
										name: "steamAppId",
										required: false,
										value: game?.steamAppId ?? null,
									}),
					
								Label("steamAppName", "Steam app name"),
					
								Control(
									{
										type: "text",
										name: "steamAppName",
										required: false,
										value: game?.steamAppName ?? null,
										placeholder: "Steam app name",
									}),
							]),
					},
				]),

			ColumnLayout(game != null ? 2 : 1,
				[
					game != null
						? Button(
							{
								style: "danger",
								type: "button",
								extraAttributes:
								{
									"data-action": "delete",
								},
								iconName: "fa-solid fa-trash",
								text: "Delete",
							})
						: null,

					Button(
						{
							style: "success",
							type: "submit",
							extraAttributes:
							{
								"data-action": "save",
							},
							iconName: game == null ? "fa-solid fa-plus" : "fa-solid fa-save",
							text: game == null ? "Create" : "Save",
						}),
				]),
		]);
}