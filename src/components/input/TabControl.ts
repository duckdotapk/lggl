//
// Imports
//

import { Child, DE } from "@lorenstuff/document-builder";

//
// Locals
//

function Tabs(buttons: Child[])
{
	return new DE("div", "component-tab-control-tabs", buttons);
}

function Tab(title: Child, active: boolean)
{
	return new DE("div",
		{
			class: "component-tab-control-tab",

			"data-active": active,
		},
		title,
	);
}

function TabContent(content: Child, active: boolean)
{
	return new DE("div",
		{
			class: "component-tab-control-tab-content",

			"data-active": active,
		},
		content,
	);
}

//
// Component
//

export type TabControlTabOptions =
{
	title: Child;
	content: Child;
};

export function TabControl(tabs: TabControlTabOptions[])
{
	return new DE("div","component-tab-control",
	[
		Tabs(tabs.map((tab, tabIndex) => Tab(tab.title, tabIndex == 0))),

		tabs.map((tab, tabIndex) => TabContent(tab.content, tabIndex == 0)),
	]);
}