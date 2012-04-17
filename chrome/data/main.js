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

Ideally the second column would not be firefox specific, but differences
between Webkit and Firefox's engine mean it might be neccessary.

*/

// Configuration
var config = {};
config.plugin = {
    label: "Buffer This Page",
    guide: 'http://bufferapp.com/guides/chrome',
    menu: {
        page: {
            label: "Buffer This Page",
            scripts: []
        },
        selection: {
            label: "Buffer Selected Text"
        },
        image: {
            label: "Buffer This Image",
            scripts: []
        },
    },
    overlay: {
        scripts: []
    },
    twitter: {
        scripts: []
    }
};

// Overlay
var attachOverlay = function (data, cb) {
    
    if( typeof data === 'function' ) cb = data;
    if( ! data ) data = {};
    if( ! cb ) cb = function () {};
    
    var worker = tabs.activeTab.attach({
        contentScriptFile: config.plugin.overlay.scripts
    });
    
    worker.port.on('buffer_get_image', function () {
        worker.port.emit("buffer_image", data.image);
    });
    
    worker.port.on('buffer_get_tweet', function () {
        worker.port.emit("buffer_tweet", data.tweet);
    });
    
    worker.port.on('buffer_done', function () {
        worker.destroy();
        cb();
    });
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
    attachOverlay(function() {});
});