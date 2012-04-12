// Buffer for Firefox

// Plugin APIs
var widgets = require("widget");
var tabs = require("tabs");
var self = require("self");
var data = self.data;
var pageMod = require("page-mod");
var selection = require("selection");

// Configuration
var config = {};
config.attributes = [
    {
        name: "url",
        get: function () {
            return tabs.activeTab.url;
        },
        encode: function (val) {
            return encodeURIComponent(val);
        }
    },
    {
        name: "text",
        get: function () {
            if(selection.text) return '"' = selection.text '"';
            return tabs.activeTab.title;
        },
        encode: function (val) {
            return encodeURIComponent(val);
        }
    },
    {
        name: "via",
        get: function (val) {
            return val;
        },
        encode: function (val) {
            return val;
        }
    },
    {
        name: "count",
        get: function (val) {
            if( ! val || val.length < 1 ) return 'vertical';
            return val;
        },
        encode: function (val) {
            return val;
        }
    },
    {
        name: "picture",
        get: function (val) {
            return val;
        },
        encode: function (val) {
            return encodeURIComponent(val);
        }
    }
];

config.plugin = {
    attributes: [
       {
            name: "utm_source",
            get: function (data) {
                return encodeURIComponent(window.location.href);
            }
        },
        {
            name: "utm_medium",
            get: function () {
                return "buffer_plugin_firefox"
            }
        },
        {
            name: "utm_campaign",
            get: function () {
                return "buffer"
            }
        }
    ]
};

// This should be abstracted out (it's duplicated)
config.overlay = {
    endpoint: 'http://bufferapp.com/bookmarklet/',
    localendpoint: 'http://local.bufferapp.com/bookmarklet/',
    getCSS: function () { return "border:none;height:100%;width:100%;position:fixed;z-index:99999999;top:0;left:0;"; }
};


// Main Plugin

// Place icon in toolbar
var widget = widgets.Widget({
    id: "buffer-button",
    label: "Buffer this page",
    contentURL: "http://bufferapp.com/favicon.ico",
    onClick: function() {

    }
});

