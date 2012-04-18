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
        scripts: ['data/buffer-port-wrapper.js', 'data/jquery-1.7.2.min.js', 'data/postmessage.js', 'data/buffer-overlay.js', 'data/buffer-chrome.js']
    },
    twitter: {
        scripts: []
    }
};

// Overlay
var executeAfter = function(done, count, data, cb) {
    if(done === count) {
        setTimeout(function(){
            cb(data)
        }, 0);
    }
};

var attachScripts = function(tab, cb) {
    
    var scripts = config.plugin.overlay.scripts;
    var i, length = scripts.length;
    var done = 0;
    
    for( i=0; i < length; i++ ) {
        console.log(scripts[i]);
        chrome.tabs.executeScript(tab.id, {
            file: scripts[i]
        }, function () {
            done += 1;
            executeAfter(done, length, tab, cb);
        });
    }

};

var attachOverlay = function (data, cb) {
    
    if( typeof data === 'function' ) cb = data;
    if( ! data ) data = {};
    if( ! cb ) cb = function () {};
    
    var tab = data.tab;

    attachScripts(tab, function (tab) {
        
        var port = PortWrapper(chrome.tabs.connect(tab.id));
        
        port.on('hello', function (data) {
            console.log("hello! ", data);
        });
        
        /*
        port.on('buffer_get_image', function () {
            port.emit("buffer_image", data.image);
        });

        port.on('buffer_get_tweet', function () {
            port.emit("buffer_tweet", data.tweet);
        });

        port.on('buffer_done', function () {
            setTimeout(function () {
                cb();
            }, 0);
        });*/
        
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
    attachOverlay({tab: tab}, function() {});
});