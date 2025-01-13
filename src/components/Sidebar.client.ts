//
// Component
//

export function updateSidebars()
{
	const pathComponents = window.location.pathname.split("/");

	const currentPage = pathComponents[1];

	const sidebars = document.querySelectorAll<HTMLElement>(".component-sidebar");

	for (const sidebar of sidebars)
	{
		const sidebarItems = sidebar.querySelectorAll<HTMLElement>(".component-sidebar-item");

		for (const sidebarItem of sidebarItems)
		{
			const page = sidebarItem.dataset["page"] ?? null;

			if (page != null && page == currentPage)
			{
				sidebarItem.classList.add("selected");
			}
			else
			{
				sidebarItem.classList.remove("selected");
			}
		}
	}
}