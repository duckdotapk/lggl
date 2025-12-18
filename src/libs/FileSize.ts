//
// Imports
//

import fs from "node:fs";
import path from "node:path";

//
// Utility Functions
//

export async function getFolderSize(folderPath: string): Promise<bigint>
{
    let totalSize = 0n;

    const entries = await fs.promises.readdir(folderPath, 
		{ 
			withFileTypes: true,
		});

    for (const entry of entries)
    {
        const fullPath = path.join(folderPath, entry.name);

        if (entry.isDirectory())
        {
            totalSize += await getFolderSize(fullPath);
        }
        else if (entry.isFile())
        {
            const { size } = await fs.promises.stat(fullPath);

            totalSize += BigInt(size);
        }
    }

    return totalSize;
}

export function fromGibiBytes(gibaBytes: number, bytes: number): bigint
{
	return BigInt(gibaBytes * 1024 ** 3 + bytes);
}

export function toGibiBytesAndBytes(inputBytes: bigint): [ number, number ]
{
	const gigaBytes = Number(inputBytes / BigInt(1024 ** 3));

	const bytes = Number(inputBytes % BigInt(1024 ** 3));

	return [ gigaBytes, bytes ];
}