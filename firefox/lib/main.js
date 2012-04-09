const widgets = require("widget");
const tabs = require("tabs");
const data = require("self").data;

// check first run
var ss = require("simple-storage");
var firstRun = (ss.storage.beenRun != true);
if (firstRun) {
	ss.storage.beenRun = true;
	tabs.open("http://bufferapp.com/guides/firefox/installed");
}

// for the Buffer icon in the add-ons bar
var widget = widgets.Widget({
	id: "buffer-button",
	label: "Buffer",
	contentURL: "http://bufferapp.com/favicon.ico",
	onClick: function() {
		tabs.activeTab.attach({
			contentScriptFile: [data.url("jquery-1.7.1.js"), data.url("postmessage.js"), data.url("buffer.js")],
			contentScript: 'doBuffer();'
	 });
	}
});

// for Twitter.com integration (http)
var pageMod = require("page-mod");
pageMod.PageMod({
	include: "http://twitter.com*",
	contentScriptWhen: 'ready',
	contentScriptFile: [data.url("jquery-1.7.1.js"), data.url("postmessage.js"), data.url('twitter-buffer.js')],
	contentScript: 'doTwitter();'
});

// for Twitter.com integration (https)
var pageMod2 = require("page-mod");
pageMod2.PageMod({
	include: "https://twitter.com*",
	contentScriptWhen: 'ready',
	contentScriptFile: [data.url("jquery-1.7.1.js"), data.url("postmessage.js"), data.url('twitter-buffer.js')],
	contentScript: 'doTwitter();'
});

// trigger Buffer with shortcut Alt+b
const { Hotkey } = require("hotkeys");
var bufferHotkey = Hotkey({
  combo: "control-alt-b",
  onPress: function() {
    tabs.activeTab.attach({
	   	contentScriptFile: [data.url("jquery-1.7.1.js"), data.url("postmessage.js"), data.url("buffer.js")],
		contentScript: 'doBuffer();'
	 });
  }
});

// Buffer from the context menu
var contextMenu = require("context-menu");
var contextMenuBuffer = contextMenu.Item({
  label: "Buffer This Page",
  contentScript: 'self.on("click", function (node, data) {' +
                 '  self.postMessage(document.URL);' +
                 '});',
  onMessage: function (pageURL) {
    tabs.activeTab.attach({
	   	contentScriptFile: [data.url("jquery-1.7.1.js"), data.url("postmessage.js"), data.url("buffer.js")],
		contentScript: 'doBuffer();'
	 });
  }
});

// Buffer from the context menu (selections)
var contextMenuBuffer = contextMenu.Item({
  label: "Buffer This Selection",
  context: contextMenu.SelectionContext(),
  contentScript: 'self.on("click", function (node, data) {' +
                 '  self.postMessage(document.URL);' +
                 '});',
  onMessage: function (pageURL) {
    tabs.activeTab.attach({
	   	contentScriptFile: [data.url("jquery-1.7.1.js"), data.url("postmessage.js"), data.url("buffer.js")],
		contentScript: 'doBuffer();'
	 });
  }
});