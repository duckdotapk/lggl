//
// Imports
//

import { initialiseTabControls } from "./components/input/TabControl.client.js";

import { initialiseFilterOptionsToolbars } from "./components/toolbar/FilterSettingsToolbar.client.js";

import { initialiseGameDetails } from "./components/GameDetails.client.js";
import { initialiseGameLists } from "./components/GameList.client.js";

//
// Client
//

initialiseTabControls();

initialiseFilterOptionsToolbars();

initialiseGameDetails();
initialiseGameLists();