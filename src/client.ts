//
// Imports
//

import { initialiseUpsertGameForms } from "./components/form/UpsertGameForm.client.js";

import { initialiseCheckboxes } from "./components/input/Checkbox.client.js";
import { initialiseControls } from "./components/input/Control.client.js";
import { initialiseTabControls } from "./components/input/TabControl.client.js";

import { initialiseFilterOptionsToolbars } from "./components/toolbar/FilterSettingsToolbar.client.js";

import { initialiseGameDetails } from "./components/GameDetails.client.js";
import { initialiseGameLists } from "./components/GameList.client.js";

//
// Client
//

initialiseUpsertGameForms();

initialiseCheckboxes();
initialiseControls();
initialiseTabControls();

initialiseFilterOptionsToolbars();

initialiseGameDetails();
initialiseGameLists();