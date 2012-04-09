var firstRun = (localStorage['hasBeenRun'] != 'true');
if (firstRun) {
	localStorage['hasBeenRun'] = 'true';
	chrome.tabs.create({url: 'http://bufferapp.com/guides/chrome/installed'});
}

chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.executeScript(null, {file: "trigger-buffer.js"});
});

function getClickHandler() {
	return function(info, tab) {
		chrome.tabs.executeScript(null, {file: "trigger-buffer.js"});
	};
};

chrome.contextMenus.create({
	"title" : "Buffer this page",
	"type" : "normal",
	"contexts" : ["page"],
	"onclick" : getClickHandler()
});
	