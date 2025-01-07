//
// Imports
//

import child_process from "node:child_process";

//
// Utility Functions
//

export async function startProcess(path: string, additionalArguments: string[])
{
	let command: string;
	let commandArguments: string[];

	switch (process.platform)
	{
		case "win32":
			command = "cmd";
			commandArguments = [ "/c", "start", "", path ];

			break;

		// TODO: make this work on macOS
		// TODO: make this work on Linux
		default:
			throw new Error("Unsupported platform: " + process.platform);
	}

	if (additionalArguments.length > 0)
	{
		commandArguments.push(...additionalArguments);
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

	switch (process.platform)
	{
		case "win32":
			command = "wmic process get ExecutablePath";

			break;

		// TODO: make this work on macOS
		// TODO: make this work on Linux
		default:
			throw new Error("Unsupported platform: " + process.platform);
	}

	return new Promise<string[]>( 
		(resolve, reject) => 
		{
			child_process.exec(command, 
				(error, stdout) => 
				{
					if (error) 
					{
						return reject(error);
					}

					const processes = stdout.split("\n").map(line => line.trim()).filter(line => line.length > 0);

					resolve(processes);
				});
		});
}

export async function isProcessRunning(basePath: string)
{
	const processes = await getRunningProcesses();

	return processes.find(process => process.startsWith(basePath)) != null;
}