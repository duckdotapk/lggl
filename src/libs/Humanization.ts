//
// Constants
//

const gibibyteUnits = [ "B", "KiB", "MiB", "GiB" ];

const gigabyteUnits = [ "B", "KB", "MB", "GB" ];

const oneDay = 86400;
const oneHour = 3600;
const oneMinute = 60;

//
// Utility Functions
//

export function formatBytesAsGibibytes(bytes: bigint)
{
	let unitIndex = 0;

	while (bytes >= 1024n && unitIndex < gibibyteUnits.length - 1)
	{
		bytes /= 1024n;

		unitIndex += 1;
	}

	return bytes.toLocaleString() + " " + gibibyteUnits[unitIndex];
}

export function formatBytesAsGigabytes(bytes: bigint)
{
	let unitIndex = 0;

	while (bytes >= 1000n && unitIndex < gigabyteUnits.length - 1)
	{
		bytes /= 1000n;

		unitIndex += 1;
	}

	return bytes.toLocaleString() + " " + gigabyteUnits[unitIndex];
}

export function formatSeconds(seconds: number, includeDays: boolean)
{
	const components: string[] = [];

	if (includeDays)
	{
		const days = Math.floor(seconds / oneDay);
	
		seconds %= oneDay;
	
		if (days > 0)
		{
			components.push(days + "d");
		}
	}

    const hours = Math.floor(seconds / oneHour);

    seconds %= oneHour;

	if (hours > 0)
	{
		components.push(hours + "h");
	}

    const minutes = Math.floor(seconds / oneMinute);

    seconds %= oneMinute;

	if (minutes > 0)
	{
		components.push(minutes + "m");
	}

	if (seconds > 0)
	{
		components.push(seconds + "s");
	}

    return components.join(" ");
}