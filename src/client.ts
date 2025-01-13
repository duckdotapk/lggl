//
// Imports
//

import { initialiseDownloadGameImagesForms } from "./components/form/DownloadGameImagesForm.client.js";
import { initialiseUpsertCompanyForms } from "./components/form/UpsertCompanyForm.client.js";
import { initialiseUpsertEngineForms } from "./components/form/UpsertEngineForm.client.js";
import { initialiseUpsertGameForms } from "./components/form/UpsertGameForm.client.js";
import { initialiseUpsertGameCompanyForms } from "./components/form/UpsertGameCompanyForm.client.js";
import { initialiseUpsertGameEngineForms } from "./components/form/UpsertGameEngineForm.client.js";

import { initialiseCheckboxes } from "./components/input/Checkbox.client.js";
import { initialiseControls } from "./components/input/Control.client.js";
import { initialiseTabControls } from "./components/input/TabControl.client.js";

import { initialiseFilterOptionsToolbars } from "./components/toolbar/FilterSettingsToolbar.client.js";

import { initialiseGameDetails } from "./components/GameDetails.client.js";
import { initialiseGameLists } from "./components/GameList.client.js";

//
// Client
//

initialiseDownloadGameImagesForms();
initialiseUpsertCompanyForms();
initialiseUpsertEngineForms();
initialiseUpsertGameForms();
initialiseUpsertGameCompanyForms();
initialiseUpsertGameEngineForms();

initialiseCheckboxes();
initialiseControls();
initialiseTabControls();

initialiseFilterOptionsToolbars();

initialiseGameDetails();
initialiseGameLists();