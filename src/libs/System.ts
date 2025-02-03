//
// Imports
//

import child_process from "node:child_process";
import fs from "node:fs";

import { z } from "zod";

//
// Schemas
//

export const ProcessRequirementsSchema = z.object(
	{
		requireExecutable: z.boolean().default(false),
		executables: z.array(z.string()).default([]),

		requireCommandLineArguments: z.boolean().default(false),
		commandLineArguments: z.array(z.string()).default([]),

		requireEnvironmentVariables: z.boolean().default(false),
		environmentVariables: z.record(z.string(), z.string()).default({}),
	});

//
// Types
//

export type ProcessRequirements = z.infer<typeof ProcessRequirementsSchema>;

export type RunningProcess =
{
	id: number;
	executable: string;
	commandLineArguments: string[];
	environmentVariables: Record<string, string>;
};

//
// Utility Functions
//

export function parseProcessRequirements(processRequirementsString: string | null): [ ProcessRequirements, null ] | [ null, string ]
{
	if (processRequirementsString == null)
	{
		return [ null, "processRequirementsString is null." ];
	}

	let processRequirementsJson;

	try
	{
		processRequirementsJson = JSON.parse(processRequirementsString);
	}
	catch (error)
	{
		return [ null, "processRequirementsString is not valid JSON." ];
	}

	const processRequirementsParseResult = ProcessRequirementsSchema.safeParse(processRequirementsJson);

	if (!processRequirementsParseResult.success)
	{
		return [ null, "processRequirementsString is not the correct shape." ];
	}

	return [ processRequirementsParseResult.data, null ];
}

export function checkRunningProcess(runningProcess: RunningProcess, processRequirements: ProcessRequirements)
{
	if (processRequirements.requireExecutable)
	{
		if (!processRequirements.executables.includes(runningProcess.executable))
		{
			return false;
		}
	}

	if (processRequirements.requireCommandLineArguments)
	{
		for (const requiredCommandLineArgument of processRequirements.commandLineArguments)
		{
			if (!runningProcess.commandLineArguments.includes(requiredCommandLineArgument))
			{
				return false;
			}
		}
	}

	if (processRequirements.requireEnvironmentVariables)
	{
		for (const [ key, value ] of Object.entries(processRequirements.environmentVariables))
		{
			if (runningProcess.environmentVariables[key] != value)
			{
				return false;
			}
		}
	}

	return true;
}

async function readRunningProcessLinux(id: number)
{
	try
	{
		const executable = await fs.promises.readlink("/proc/" + id + "/exe");
	
		const commandLine = await fs.promises.readFile("/proc/" + id + "/cmdline", { encoding: "utf8" });
	
		const commandLineArguments = commandLine.split("\0");
	
		const environment = await fs.promises.readFile("/proc/" + id + "/environ", { encoding: "utf8" });
	
		const environmentVariables: Record<string, string> = {};
	
		for (const environmentVariable of environment.split("\0"))
		{
			const [ key, value ] = environmentVariable.split("=", 2);
	
			environmentVariables[key as string] = value as string;
		}
	
		return {
			id,
			executable,
			commandLineArguments,
			environmentVariables,
		};
	}
	catch (error)
	{
		return null;
	}
}

async function searchForRunningProcessLinux(processRequirements: ProcessRequirements)
{
	const procEntries = await fs.promises.readdir("/proc", { withFileTypes: true });

	for (const procEntry of procEntries)
	{
		if (!procEntry.isDirectory())
		{
			continue;
		}

		if (!/^\d+$/.test(procEntry.name))
		{
			continue;
		}

		const id = parseInt(procEntry.name);

		const runningProcess = await readRunningProcessLinux(id);

		if (runningProcess == null)
		{
			continue;
		}

		const runningProcessMatchesRequirements = checkRunningProcess(runningProcess, processRequirements);

		if (!runningProcessMatchesRequirements)
		{
			continue;
		}

		return runningProcess;
	}

	return null;
}

export async function searchForRunningProcess(processRequirements: ProcessRequirements)
{
	switch (process.platform)
	{
		case "linux":
			return searchForRunningProcessLinux(processRequirements);

		// TODO: make this work on Windows
		// TODO: make this work on macOS
		default:
			console.error("[GamePlayActionLib] Unsupported platform %s.", process.platform);

			return null;
	}
}

export function startProcessViaExecutable(executablePath: string, workingDirectory: string | null, additionalArguments: string[] | null)
{
	const child = child_process.spawn(executablePath, additionalArguments ?? [],
		{
			cwd: workingDirectory ?? undefined,
			detached: true,
			stdio: "ignore",
		});

	child.unref();
}

export function startProcessViaUrl(url: string)
{
	let command: string;

	switch (process.platform)
	{
		case "win32":
			command = "start";

			break;

		case "linux":
			command = "xdg-open";

			break;

		case "darwin":
			command = "open";

			break;

		default:
			throw new Error("Unsupported platform: " + process.platform);
	}

	const child = child_process.spawn(command, [ url ],
		{
			detached: true,
			stdio: "ignore",
		});

	child.unref();
}

export async function findRunningProcess(processRequirements: ProcessRequirements, maxAttempts: number, interval: number)
{
	console.log("[SystemLib] Finding process...");

	for (let attempt = 1; attempt <= maxAttempts; attempt++)
	{
		console.log("[SystemLib] findProcess attempt %d of %d...", attempt, maxAttempts);

		const runningProcess = await searchForRunningProcess(processRequirements);

		if (runningProcess != null)
		{
			console.log("[SystemLib] findProcess found process after %d attempts: %d => %s", attempt, runningProcess.id, runningProcess.executable);

			return runningProcess;
		}

		await new Promise(resolve => setTimeout(resolve, interval));
	}

	return null;
}

async function isProcessStillRunningLinux(runningProcess: RunningProcess): Promise<boolean>
{
	const currentGameProcess = await readRunningProcessLinux(runningProcess.id);

	if (currentGameProcess == null)
	{
		return false;
	}

	if (runningProcess.executable != currentGameProcess.executable)
	{
		return false;
	}

	if (runningProcess.commandLineArguments.length != currentGameProcess.commandLineArguments.length)
	{
		return false;
	}

	for (let i = 0; i < runningProcess.commandLineArguments.length; i++)
	{
		if (runningProcess.commandLineArguments[i] != currentGameProcess.commandLineArguments[i])
		{
			return false;
		}
	}

	if (Object.keys(runningProcess.environmentVariables).length != Object.keys(currentGameProcess.environmentVariables).length)
	{
		return false;
	}

	for (const [ key, value ] of Object.entries(runningProcess.environmentVariables))
	{
		if (currentGameProcess.environmentVariables[key] != value)
		{
			return false;
		}
	}

	return true;
}

export async function isProcessStillRunning(runningProcess: RunningProcess): Promise<boolean>
{
	switch (process.platform)
	{
		case "linux":
		{
			return isProcessStillRunningLinux(runningProcess);
		}

		// TODO: make this work on Windows
		// TODO: make this work on macOS
		default:
		{
			console.error("[SystemLib] isProcessStillRunning unsupported platform: %s", process.platform);

			return false;
		}
	}
}