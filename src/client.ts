//
// Imports
//

import { initialiseChooseGamePlayActionDialogs, initialiseOpenChooseGamePlayActionDialogButtons } from "./components/dialogs/ChooseGamePlayActionDialog.client.js";
import { initialiseGameNotesDialogs, initialiseOpenGameNotesDialogButtons } from "./components/dialogs/GameNotesDialog.client.js";

import { initialiseDownloadGameImagesForms } from "./components/form/DownloadGameImagesForm.client.js";
import { initialiseSyncGameHistoricalSteamPlayTimeForm } from "./components/form/SyncGameHistoricalPlayTimeForm.client.js";
import { initialiseUpsertCompanyForms } from "./components/form/UpsertCompanyForm.client.js";
import { initialiseUpsertEngineForms } from "./components/form/UpsertEngineForm.client.js";
import { initialiseUpsertGameForms } from "./components/form/UpsertGameForm.client.js";
import { initialiseUpsertGameCompanyForms } from "./components/form/UpsertGameCompanyForm.client.js";
import { initialiseUpsertGameEngineForms } from "./components/form/UpsertGameEngineForm.client.js";
import { initialiseUpsertGameInstallationForms } from "./components/form/UpsertGameInstallationForm.client.js";
import { initialiseUpsertGamePlatformForms } from "./components/form/UpsertGamePlatformForm.client.js";
import { initialiseUpsertGamePlayActionForms } from "./components/form/UpsertGamePlayActionForm.client.js";
import { initialiseUpsertPlatformForms } from "./components/form/UpsertPlatformForm.client.js";

import { initialiseCheckboxes } from "./components/input/Checkbox.client.js";
import { initialiseControls } from "./components/input/Control.client.js";
import { initialiseTabControls } from "./components/input/TabControl.client.js";

import { initialiseListLayouts, updateListLayouts } from "./components/layout/ListLayout.client.js";

import { initialiseCompanySettingsToolbars } from "./components/toolbar/CompanySettingsToolbar.client.js";
import { initialiseEngineSettingsToolbars } from "./components/toolbar/EngineSettingsToolbar.client.js";
import { initialiseGameSettingsToolbars } from "./components/toolbar/GameSettingsToolbar.client.js";
import { initialisePlatformSettingsToolbars } from "./components/toolbar/PlatformSettingsToolbar.client.js";

import { updateSidebars } from "./components/Sidebar.client.js";

import * as PjaxClientLib from "./libs/client/Pjax.client.js";

//
// Client
//

async function initialiseComponents()
{
	//
	// Initialise Components
	//

	initialiseChooseGamePlayActionDialogs();
	initialiseOpenChooseGamePlayActionDialogButtons();
	initialiseGameNotesDialogs();
	initialiseOpenGameNotesDialogButtons();

	initialiseDownloadGameImagesForms();
	initialiseSyncGameHistoricalSteamPlayTimeForm();
	initialiseUpsertCompanyForms();
	initialiseUpsertEngineForms();
	initialiseUpsertGameForms();
	initialiseUpsertGameCompanyForms();
	initialiseUpsertGameEngineForms();
	initialiseUpsertGameInstallationForms();
	initialiseUpsertGamePlatformForms();
	initialiseUpsertGamePlayActionForms();
	initialiseUpsertPlatformForms();
	
	initialiseCheckboxes();
	initialiseControls();
	initialiseTabControls();
	
	initialiseListLayouts();
	
	initialiseCompanySettingsToolbars();
	initialiseEngineSettingsToolbars();
	initialiseGameSettingsToolbars();
	initialisePlatformSettingsToolbars();

	//
	// Update Components
	//

	updateListLayouts();
	
	updateSidebars();
}

initialiseComponents();

document.addEventListener("lggl:reinitialise", () => initialiseComponents());

PjaxClientLib.initialise();