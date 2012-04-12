// Buffer for Firefox

// Plugin APIs
var widgets = require("widget");
var tabs = require("tabs");
var self = require("self");
var pageMod = require("page-mod");
var selection = require("selection");
var ss = require("simple-storage");

// Configuration
var config = {};
config.attributes = [
    {
        name: "url",
        get: function (tab) {
            return tab.url;
        }
    },
    {
        name: "text",
        get: function (tab) {
            if(selection.text) return '"' + selection.text + '"';
            return tab.title;
        }
    }
];

config.plugin = {
    label: "Add this page to your Buffer",
    icon: "http://bufferapp.com/favicon.ico",
    guide: 'http://bufferapp.com/guides/firefox'
};

// Main Plugin

var active = false;

var overlay = function() {
    
    if(active) return;
    active = true;
    
    var tab = tabs.activeTab;
    var worker = tab.attach({
      contentScriptFile: self.data.url('buffer-overlay.js')
    });
    
    var data = {};
    for(var i=0; i < config.attributes.length; i++) {
        var a = config.attributes[i];
        data[a.name] = a.get(tab);
    }
    
    worker.port.emit('buffer_data', data);
    
    worker.port.on('buffer_done', function() {
        active = false;
    })
    
};

// Show guide on first run
if( ! ss.storage.run ) {
    ss.storage.run = true;
    tabs.open({
      url: config.plugin.guide,
      inNewWindow: true
    });
}

// Place icon in addon bar
var widget = widgets.Widget({
    id: "buffer-button",
    label: config.plugin.label,
    contentURL: config.plugin.icon,
    onClick: function () {
        overlay();
    }
});

