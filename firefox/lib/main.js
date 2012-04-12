// Buffer for Firefox

var widgets = require("widget");
var tabs = require("tabs");
var self = require("self");
 
// Place icon in toolbar
var widget = widgets.Widget({
  id: "buffer-link",
  label: "Buffer this page",
  contentURL: self.data.url("icon.png"),
  onClick: function() {
    tabs.open("http://bufferapp.com/");
  }
});