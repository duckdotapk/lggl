//
// Imports
//

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

import { initialiseListLayouts } from "./components/layout/ListLayout.client.js";

import { initialiseFilterOptionsToolbars } from "./components/toolbar/FilterSettingsToolbar.client.js";

import { initialiseGameDetails } from "./components/GameDetails.client.js";
import { initialiseGameLists } from "./components/GameList.client.js";

//
// Client
//

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

initialiseFilterOptionsToolbars();

initialiseGameDetails();
initialiseGameLists();