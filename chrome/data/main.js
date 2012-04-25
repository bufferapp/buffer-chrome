/*

Buffer for Chrome

Authors: Joel Gascoigne         Tom Ashworth
         joel@bufferapp.com     tom.a@bufferapp.com

*/

// Configuration
var config = {};
config.plugin = {
    label: "Buffer This Page",
    guide: 'http://bufferapp.com/guides/chrome',
    menu: {
        page: {
            label: "Buffer This Page"
        },
        selection: {
            label: "Buffer Selected Text"
        },
        image: {
            label: "Buffer This Image"
        },
    }
};

// Overlay
var attachOverlay = function (data, cb) {
    
    if( typeof data === 'function' ) cb = data;
    if( ! data ) data = {};
    if( ! cb ) cb = function () {};
    
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
    attachOverlay({tab: tab});
});

// Context menus
// Page
chrome.contextMenus.create({
    title: config.plugin.menu.page.label,
    contexts: ["page"],
    onclick: function (info, tab) {
        attachOverlay({tab: tab});
    }
});

// Selection
chrome.contextMenus.create({
    title: config.plugin.menu.selection.label,
    contexts: ["selection"],
    onclick: function (info, tab) {
        attachOverlay({tab: tab});
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
                port.emit("buffer_twitter_clear");
            }
        });
    });
    
});
