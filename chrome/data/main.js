/*

Buffer for Chrome

Authors: Joel Gascoigne         Tom Ashworth
         joel@bufferapp.com     tom.a@bufferapp.com

*/

// Configuration
var config = {};
config.plugin = {
    label: "Buffer This Page",
    version: "2.1.4",
    placement_prefix: 'chrome-',
    guide: 'http://bufferapp.com/guides/chrome/installed',
    menu: {
        page: {
            label: "Buffer This Page"
        },
        selection: {
            label: "Buffer Selected Text"
        },
        image: {
            label: "Buffer This Image"
        }
    }
};

// Overlay
var attachOverlay = function (data, cb) {
    
    if( typeof data === 'function' ) cb = data;
    if( ! data ) data = {};
    if( ! cb ) cb = function () {};
    if( ! data.embed ) data.embed = {};
    
    var tab = data.tab;
        
    var port = PortWrapper(chrome.tabs.connect(tab.id));

    // Remove the port once the Buffering is complete
    port.on('buffer_done', function (overlayData) {
        port.destroy();
        port = null;
        setTimeout(function () {
            cb(overlayData);
        }, 0);
    });
    
    // Don't try to JSON encode a tab
    data.tab = null;
    // Pass statistic data
    data.version = config.plugin.version;
    if( data.embed.placement ) data.embed.placement = config.plugin.placement_prefix + data.embed.placement;
    if( data.placement ) data.placement = config.plugin.placement_prefix + data.placement;
    else if( data.embed.placement ) data.placement = data.embed.placement;
    // Inform overlay that click has occurred
    port.emit("buffer_click", data);
    
};

// Show the guide on first run
if( ! localStorage.getItem('buffer.run') ) {
    localStorage.setItem('buffer.run', true);
    chrome.tabs.create({
        url: config.plugin.guide
    })
}

// Fire the overlay when the button is clicked
chrome.browserAction.onClicked.addListener(function(tab) {
    attachOverlay({tab: tab, placement: 'toolbar'});
});

// Context menus
// Page
chrome.contextMenus.create({
    title: config.plugin.menu.page.label,
    contexts: ["page"],
    onclick: function (info, tab) {
        attachOverlay({tab: tab, placement: 'menu-page'});
    }
});

// Selection
chrome.contextMenus.create({
    title: config.plugin.menu.selection.label,
    contexts: ["selection"],
    onclick: function (info, tab) {
        attachOverlay({tab: tab, placement: 'menu-selection'});
    }
});

// Listen for embedded events (twitter/hacker news)
chrome.extension.onConnect.addListener(function(chport) {
    
    if( chport.name !== "buffer-embed" ) return; 

    var port = PortWrapper(chport);
    var tab = port.raw.sender.tab;
    
    // Listen for embedded triggers
    port.on("buffer_click", function (embed) {
        attachOverlay({tab: tab, embed: embed}, function (overlaydata) {
            if( !!overlaydata.sent ) {
                // Buffer was sent
                port.emit("buffer_embed_clear");
            }
        });
    });
    
});
