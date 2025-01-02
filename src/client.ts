//
// Imports
//

import { initialiseFilterOptionsToolbars } from "./components/toolbars/FilterOptionsToolbar.client.js";
import { initialiseGameFlagsToolbars } from "./components/toolbars/GameFlagsToolbar.client.js";

import { initialiseGameDetails } from "./components/GameDetails.client.js";
import { initialiseSidebars } from "./components/Sidebar.client.js";

//
// Client
//

initialiseFilterOptionsToolbars();
initialiseGameFlagsToolbars();

initialiseGameDetails();
initialiseSidebars();