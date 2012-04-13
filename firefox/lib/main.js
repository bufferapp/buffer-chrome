/*

Buffer for Firefox

Authors: Joel Gascoigne         Tom Ashworth
         joel@bufferapp.com     tom.a@bufferapp.com

Architecture

addon           | content script
------------------------------------------------------------
browser-specific                    | non-specific
--OVERLAY---------------------------------------------------
widgets         | gather data       | create iframe
context menu    | go iframe         | close iframe
hotkeys         | notify plugin     |
                |                   |
main.js         | buffer-firefox.js | buffer-overlay.js
--TWITTER---------------------------------------------------
page mod        |                   | inject buffer links
                |                   |
                |                   | buffer-twitter.js
------------------------------------------------------------                

Ideally the second column would not be firefox specific, but differences
between Webkit and Firefox's engine mean it might be neccessary.

*/

// Plugin APIs
var widgets = require("widget");
var tabs = require("tabs");
var self = require("self");
var pageMod = require("page-mod");
var selection = require("selection");
var ss = require("simple-storage");
var { Hotkey } = require('hotkeys');
var cm = require("context-menu");

// Configuration
var config = {};
config.plugin = {
    label: "Buffer This Page",
    icon: "http://bufferapp.com/favicon.ico",
    guide: 'http://bufferapp.com/guides/firefox',
    menu: {
        page: {
            label: "Buffer This Page",
            scripts: [self.data.url('menu/buffer-page.js')]
        },
        selection: {
            label: "Buffer Selected Text"
        },
        image: {
            label: "Buffer This Image",
            scripts: [self.data.url('menu/buffer-image.js')]
        },
    },
    overlay: {
        scripts: [self.data.url('jquery-1.7.2.min.js'), self.data.url('postmessage.js'), self.data.url('buffer-overlay.js'), self.data.url('buffer-firefox.js')]
    },
    twitter: {
        scripts: [self.data.url('jquery-1.7.2.min.js'), self.data.url('buffer-twitter.js')]
    }
};

// Overlay
var attachOverlay = function (image) {
    if( ! image ) image = null;
    
    var worker = tabs.activeTab.attach({
        contentScriptFile: config.plugin.overlay.scripts
    });
    
    worker.port.on('buffer_get_image', function () {
        worker.port.emit("buffer_image", image);
    });
    
    worker.port.on('buffer_done', function () {
        //console.log("destroying");
        //worker.destroy();
    });
};

// Show guide on first run
if( ! ss.storage.run ) {
    ss.storage.run = true;
    tabs.open({
      url: config.plugin.guide,
      inNewWindow: true
    });
}

// Buffer this page
var button = widgets.Widget({
    id: 'buffer-button',
    label: config.plugin.label,
    contentURL: config.plugin.icon
})

button.on('click', function () {
    attachOverlay();  
})

// Context menu
var menu = {}
menu.page = cm.Item({
    label: config.plugin.menu.page.label,
    image: config.plugin.icon,
    context: cm.PageContext(),
    contentScriptFile: config.plugin.menu.page.scripts,
    contentScriptWhen: 'start',
    onMessage: function (data) {
        if(data == 'buffer_click') {
            attachOverlay();
        }
    }
})
menu.selection = cm.Item({
    label: config.plugin.menu.selection.label,
    image: config.plugin.icon,
    context: cm.SelectionContext(),
    contentScriptFile: config.plugin.menu.page.scripts,
    contentScriptWhen: 'start',
    onMessage: function (data) {
        if(data == 'buffer_click') {
            attachOverlay();
        }
    }
})
/*
menu.image = cm.Item({
    label: config.plugin.menu.image.label,
    image: config.plugin.icon,
    context: cm.SelectorContext("img"),
    contentScriptFile: config.plugin.menu.image.scripts,
    contentScriptWhen: 'start',
    onMessage: function (image) {
        attachOverlay(image);
    }
})*/

