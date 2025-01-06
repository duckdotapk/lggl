//
// Imports
//

import fs from "node:fs";
import path from "node:path";

import { LGGL_DATA_DIRECTORY } from "../env/LGGL_DATA_DIRECTORY.js";

//
// Utility Functions
//

export async function downloadUrl(url: string, pathComponents: string[])
{
	const response = await fetch(url);

	if (!response.ok)
	{
		return false;
	}

	const responseBlob = await response.blob();

	const responseBuffer = Buffer.from(await responseBlob.arrayBuffer());

	const responsePath = path.join(LGGL_DATA_DIRECTORY, ...pathComponents);

	await fs.promises.mkdir(path.dirname(responsePath), 
		{ 
			recursive: true,
		});

	await fs.promises.writeFile(responsePath, responseBuffer);

	return true;
}