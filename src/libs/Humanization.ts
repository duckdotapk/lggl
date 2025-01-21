//
// Constants
//

const gibibyteUnits = [ "B", "KiB", "MiB", "GiB" ];

const gigabyteUnits = [ "B", "KB", "MB", "GB" ];

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