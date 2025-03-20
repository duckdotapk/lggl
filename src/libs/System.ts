//
// Imports
//

import child_process from "node:child_process";
import fs from "node:fs";

import shellQuote from "shell-quote";
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

export const Win32ProcessSchema = z.object(
	{
		ProcessId: z.number(),
		Name: z.string(),
		ExecutablePath: z.string().nullable(),
		CommandLine: z.string().nullable(),
	});

export const StartInfoEnvironmentVariablesSchema = z.array(z.object(
	{
		Key: z.string(),
		Value: z.string(),
	}));

//
// Types
//

export type ProcessRequirements = z.infer<typeof ProcessRequirementsSchema>;

export type Win32Process = z.infer<typeof Win32ProcessSchema>;

export type StartInfoEnvironmentVariables = z.infer<typeof StartInfoEnvironmentVariablesSchema>;

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

async function readRunningProcessLinux(processRequirements: ProcessRequirements, id: number): Promise<RunningProcess | null>
{
	try
	{
		const executable = await fs.promises.readlink("/proc/" + id + "/exe");
	
		const commandLine = await fs.promises.readFile("/proc/" + id + "/cmdline", { encoding: "utf8" });
	
		const commandLineArguments = commandLine.split("\0");
	
		const runningProcess: RunningProcess =
		{
			id,
			executable,
			commandLineArguments,
			environmentVariables: {},
		};

		if (!processRequirements.requireEnvironmentVariables)
		{
			return runningProcess;
		}

		const environment = await fs.promises.readFile("/proc/" + id + "/environ", { encoding: "utf8" });
	
		for (const environmentVariable of environment.split("\0"))
		{
			const [ key, value ] = environmentVariable.split("=", 2);
	
			runningProcess.environmentVariables[key as string] = value as string;
		}

		return runningProcess;
	}
	catch (error)
	{
		return null;
	}
}

async function readRunningProcessWindows(processRequirements: ProcessRequirements, id: number): Promise<RunningProcess | null>
{
	let win32Process: Win32Process;

	try
	{
		const runningProcessCommand =
		[
			"Get-CimInstance Win32_Process",
			"Where-Object { $_.ProcessId -eq " + id + " }",
			"Select-Object ProcessId, Name, ExecutablePath, CommandLine",
			"ConvertTo-Json"
		].join(" | ");

		const rawRunningProcess = child_process.execSync("powershell -Command \"" + runningProcessCommand + "\"", { encoding: "utf8" });

		win32Process = Win32ProcessSchema.parse(JSON.parse(rawRunningProcess));
	}
	catch (error)
	{
		// Note: This is a common error when the process has already exited.
		// console.error("[SystemLib] runningProcessCommand error:", error);

		return null;
	}
    
    if (win32Process.ExecutablePath == null)
    {
        return null;
    }

    const commandLineArguments = shellQuote.parse(win32Process.CommandLine ?? "").filter((argument) => typeof argument === "string");

	const runningProcess: RunningProcess =
	{
		id: win32Process.ProcessId,
		executable: win32Process.ExecutablePath,
		commandLineArguments,
		environmentVariables: {},
	}

	if (!processRequirements.requireEnvironmentVariables)
	{
		return runningProcess;
	}

	try
	{
		const environmentVariablesCommand = "(Get-Process -Id " + id + ").StartInfo.EnvironmentVariables | ConvertTo-Json";
		const rawEnvironmentVariables = child_process.execSync("powershell -Command \"" + environmentVariablesCommand + "\"", { encoding: "utf8" });
		const startInfoEnvironmentVariables = StartInfoEnvironmentVariablesSchema.parse(JSON.parse(rawEnvironmentVariables));
		
		for (const startInfoEnvironmentVariable of startInfoEnvironmentVariables)
		{
			runningProcess.environmentVariables[startInfoEnvironmentVariable.Key] = startInfoEnvironmentVariable.Value;
		}
	}
	catch (error)
	{
		console.error("[SystemLib] environmentVariablesCommand error:", error);

		return null;
	}
    
    return runningProcess;
}

export async function readRunningProcess(processRequirements: ProcessRequirements, id: number): Promise<RunningProcess | null>
{
	switch (process.platform)
	{
		case "linux":
			return await readRunningProcessLinux(processRequirements, id);

		case "win32":
			return await readRunningProcessWindows(processRequirements, id);

		default:
			console.error("[SystemLib] Unsupported platform %s.", process.platform);

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

		const runningProcess = await readRunningProcessLinux(processRequirements, id);

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

async function searchForRunningProcessWindows(processRequirements: ProcessRequirements)
{
	console.log("[SystemLib] [searchForRunningProcessWindows] Getting session ID...");

	const sessionIdCommand = "(Get-Process -Id $PID).SessionId"
	const rawSessionId = child_process.execSync("powershell -Command \"" + sessionIdCommand + "\"", { encoding: "utf8" }).trim();
	const sessionId = parseInt(rawSessionId);

	if (isNaN(sessionId))
	{
		console.error("[SystemLib] [searchForRunningProcessWindows] Failed to parse sessionId: %s", rawSessionId);

		return null;
	}

	console.log("[SystemLib] [searchForRunningProcessWindows] Session ID: %d", sessionId);

	console.log("[SystemLib] [searchForRunningProcessWindows] Getting running processes...");

	let win32Processes: Win32Process[] = [];

	try 
	{
		const runningProcessesCommand =
		[
			"Get-CimInstance Win32_Process",
			"Where-Object { $_.SessionId -eq " + sessionId + " }",
			"Select-Object ProcessId, Name, ExecutablePath, CommandLine",
			"ConvertTo-Json",
		].join(" | ");
		const rawRunningProcesses = child_process.execSync("powershell -Command \"" + runningProcessesCommand + "\"", { encoding: "utf8" });
		win32Processes = z.array(Win32ProcessSchema).parse(JSON.parse(rawRunningProcesses));
	}
	catch (error)
	{
		console.log("[SystemLib] [searchForRunningProcessWindows] runningProcessesCommand error:", error);

		return null;
	}

	console.log("[SystemLib] [searchForRunningProcessWindows] Found %d running processes.", win32Processes.length);

	console.log("[SystemLib] [searchForRunningProcessWindows] Checking running processes...");

	for (const win32Process of win32Processes)
	{
		if (win32Process.ExecutablePath == null)
		{
			continue;
		}

		const commandLineArguments = shellQuote.parse(win32Process.CommandLine ?? "").filter((argument) => typeof argument === "string");

		const runningProcess: RunningProcess =
		{
			id: win32Process.ProcessId,
			executable: win32Process.ExecutablePath,
			commandLineArguments,
			environmentVariables: {},
		}

		// Note: Skipping environment variables, when they're not needed, saves a lot of time.
		if (processRequirements.requireEnvironmentVariables)
		{
			const environmentVariablesCommand = "(Get-Process -Id " + win32Process.ProcessId + ").StartInfo.EnvironmentVariables | ConvertTo-Json";
			const rawEnvironmentVariables = child_process.execSync("powershell -Command \"" + environmentVariablesCommand + "\"", { encoding: "utf8" });
			const startInfoEnvironmentVariables = StartInfoEnvironmentVariablesSchema.parse(JSON.parse(rawEnvironmentVariables));
	
			for (const startInfoEnvironmentVariable of startInfoEnvironmentVariables)
			{
				runningProcess.environmentVariables[startInfoEnvironmentVariable.Key] = startInfoEnvironmentVariable.Value;
			}
		}

		const runningProcessMatchesRequirements = checkRunningProcess(runningProcess, processRequirements);

		if (!runningProcessMatchesRequirements)
		{
			continue;
		}

		return runningProcess;
	}

	console.log("[SystemLib] [searchForRunningProcessWindows] No running processes match requirements.");

	return null;
}

export async function searchForRunningProcess(processRequirements: ProcessRequirements)
{
	switch (process.platform)
	{
		case "linux":
			return searchForRunningProcessLinux(processRequirements);

		case "win32":
			return searchForRunningProcessWindows(processRequirements);

		// TODO: make this work on macOS
		default:
			console.error("[GamePlayActionLib] Unsupported platform %s.", process.platform);

			return null;
	}
}

export function startProcessViaExecutable(executablePath: string, workingDirectory: string | null, additionalArguments: string[] | null)
{
	additionalArguments = additionalArguments ?? [];

	switch (process.platform)
	{
		case "linux":
		{
			const child = child_process.spawn(executablePath, additionalArguments,
				{
					cwd: workingDirectory ?? undefined,
					detached: true,
					stdio: "ignore",
				});

			child.unref();

			break;
		}

		case "win32":
		{
			const child = child_process.spawn("cmd", [ "/c", "start", "", executablePath, ...additionalArguments ],
				{
					cwd: workingDirectory ?? undefined,
					detached: true,
					stdio: "ignore",
				});

			child.unref();

			break;
		}
	}

}

export function startProcessViaUrl(url: string)
{
	switch (process.platform)
	{
		case "linux":
		{
			const child = child_process.spawn("xdg-open", [ url ],
				{
					detached: true,
					stdio: "ignore",
				});

			child.unref();

			break;
		}

		case "win32":
		{
			const child = child_process.spawn("cmd", [ "/c", "start", url ],
				{
					detached: true,
					stdio: "ignore",
				});

			child.unref();
	
			break;
		}

		default:
			throw new Error("Unsupported platform: " + process.platform);
	}
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

export async function isProcessStillRunning(processRequirements: ProcessRequirements, cachedRunningProcess: RunningProcess): Promise<boolean>
{
	const currentRunningProcess = await readRunningProcess(processRequirements, cachedRunningProcess.id);

	if (currentRunningProcess == null)
	{
		return false;
	}

	if (processRequirements.requireExecutable)
	{
		if (cachedRunningProcess.executable != currentRunningProcess.executable)
		{
			return false;
		}
	}

	if (processRequirements.requireCommandLineArguments)
	{
		if (cachedRunningProcess.commandLineArguments.length != currentRunningProcess.commandLineArguments.length)
		{
			return false;
		}
	
		for (let i = 0; i < cachedRunningProcess.commandLineArguments.length; i++)
		{
			if (cachedRunningProcess.commandLineArguments[i] != currentRunningProcess.commandLineArguments[i])
			{
				return false;
			}
		}
	}

	if (processRequirements.requireEnvironmentVariables)
	{
		if (Object.keys(cachedRunningProcess.environmentVariables).length != Object.keys(currentRunningProcess.environmentVariables).length)
		{
			return false;
		}
	
		for (const [ key, value ] of Object.entries(cachedRunningProcess.environmentVariables))
		{
			if (currentRunningProcess.environmentVariables[key] != value)
			{
				return false;
			}
		}
	}

	return true;
}