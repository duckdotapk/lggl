//
// Imports
//

import child_process from "node:child_process";

import { z } from "zod";

//
// Utility Functions
//

export async function startExecutable(executablePath: string, workingDirectory: string | null, additionalArguments: string[])
{
	const child = child_process.spawn(executablePath, additionalArguments,
		{
			cwd: workingDirectory ?? undefined,
			detached: true,
			stdio: "ignore",
		});

	child.unref();
}

export async function startUrl(url: string)
{
	let command: string;
	let commandArguments: string[];

	switch (process.platform)
	{
		case "win32":
			command = "cmd";
			commandArguments = [ "/c", "start", "", url ];

			break;

		// TODO: make this work on macOS
		// TODO: make this work on Linux
		default:
			throw new Error("Unsupported platform: " + process.platform);
	}

	const child = child_process.spawn(command, commandArguments,
		{
			detached: true,
			stdio: "ignore",
		});

	child.unref();
}

export async function getRunningProcesses()
{
	let command: string;
	let execOptions: child_process.ExecOptions;

	switch (process.platform)
	{
		case "win32":
			command = `powershell -Command "Get-Process | Select-Object -Property Path | ConvertTo-Json"`;
			execOptions =
			{
				maxBuffer: 1024 * 1024 * 1024,
				windowsHide: true,
			};

			break;

		// TODO: make this work on macOS
		// TODO: make this work on Linux
		default:
			throw new Error("Unsupported platform: " + process.platform); 
	}

	return new Promise<string[]>((resolve, reject) => child_process.exec(command, execOptions,
		(error, stdout) => 
		{
			if (error)
			{
				return reject(error);
			}

			const processes = z.array(z.object({ Path: z.string().nullable() })).parse(JSON.parse(stdout));

			const processPaths = processes.filter(process => process.Path != null).map(process => process.Path!);

			resolve(processPaths);
		}));
}

export async function isProcessRunning(basePath: string)
{
	const processes = await getRunningProcesses();

	return processes.find(process => process.startsWith(basePath)) != null;
}