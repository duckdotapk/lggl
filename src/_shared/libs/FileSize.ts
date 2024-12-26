//
// Utility Functions
//

export function fromGibiBytes(gigaBytes: number, bytes: number): bigint
{
	return BigInt(gigaBytes * 1024 ** 3 + bytes);
}

export function toGibiBytesAndBytes(inputBytes: bigint): [ number, number ]
{
	const gigaBytes = Number(inputBytes / BigInt(1024 ** 3));

	const bytes = Number(inputBytes % BigInt(1024 ** 3));

	return [ gigaBytes, bytes ];
}