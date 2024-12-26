//
// Imports
//

import "source-map-support/register.js";

import path from "node:path";

import { routerMiddleware, server } from "./instances/server.js";

//
// Load Routes
//

const routes = await routerMiddleware.loadRoutesDirectory(path.join(import.meta.dirname, "routes"));

console.log("Loaded " + routes.length + " routes.");

//
// Start Server
//

// TODO: make port configurable
await server.start(8008);

console.log("Listening on port " + 8008 + "...");