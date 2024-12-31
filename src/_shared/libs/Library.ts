//
// Types
//

export type FilterOptions =
{
	groupMode: "lastPlayed";
	sortMode: "lastPlayed";

	groupFavoritesSeparately: boolean;
};

//
// Utility Functions
//

export function parseFilterOptions(searchParameters: URLSearchParams): FilterOptions
{
	let groupMode: FilterOptions["groupMode"];

	switch (searchParameters.get("groupMode"))
	{
		case "lastPlayed":
		default:
			groupMode = "lastPlayed";

			break;
	}

	let sortMode: FilterOptions["sortMode"];

	switch (searchParameters.get("sortMode"))
	{
		case "lastPlayed":
		default:
			sortMode = "lastPlayed";

			break;
	}

	const groupFavoritesSeparately = searchParameters.has("groupFavoritesSeparately")
		? searchParameters.get("groupFavoritesSeparately") == "true"
		: true;

	return {
		groupMode,
		sortMode,

		groupFavoritesSeparately,
	};
}