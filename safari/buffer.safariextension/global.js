function performCommand(event)
{
	if (event.command === "addToBuffer") {
		safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("activate buffer", null);
	}
}
safari.application.addEventListener("command", performCommand, true);