/*

Buffer for Chrome

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
main.js         | buffer-chrome.js  | buffer-overlay.js
--TWITTER---------------------------------------------------
page mod        |                   | inject buffer links
                |                   |
                |                   | buffer-twitter.js
------------------------------------------------------------                

Ideally the second column would not be browser specific, but differences
between extension APIs engine mean it's be neccessary.

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

    port.on('buffer_get_image', function () {
        port.emit("buffer_image", data.image);
    });

    port.on('buffer_get_tweet', function () {
        port.emit("buffer_tweet", data.tweet);
    });

    port.on('buffer_done', function () {
        port.destroy();
        port = null;
        setTimeout(function () {
            cb();
        }, 0);
    });
    
    port.emit("buffer_click");
    
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

// Listen for twitter events
chrome.extension.onConnect.addListener(function(chport) {
    console.log("twitter-ping");
    if( chport.name !== "buffer-twitter" ) return; 
    console.log("yes! it's a twitter-ping");

    var port = PortWrapper(chport);
    var tab = port.raw.sender.tab;
    
    console.log("sender: ", tab.id);
    
    port.on("buffer_click", function (tweet) {
       attachOverlay({tab: tab, tweet: tweet}); 
    });
    
    
});