/*

Buffer for Chrome

Authors: Joel Gascoigne         Tom Ashworth
         joel@bufferapp.com     tom.a@bufferapp.com

*/

// Configuration
var config = {};
config.plugin = {
    label: "Buffer This Page",
    version: "2.2.3",
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
        overlayPort = null;
        setTimeout(function () {
            cb(overlayData);
        }, 0);
    });
    
    // Don't try to JSON encode a tab
    data.tab = null;

    // Pass statistic data
    data.version = config.plugin.version;
	if( data.embed.placement ) data.placement = data.embed.placement;

    // Inform overlay that click has occurred
    port.emit("buffer_click", data);
};

// Show the guide on first run
if( ! localStorage.getItem('buffer.run') ) {
    localStorage.setItem('buffer.run', true);
    chrome.tabs.create({
        url: config.plugin.guide
    });
}

// Set up options
if( ! localStorage.getItem('buffer.op') ) {
    localStorage.setItem('buffer.op', true);

    // Grab the options page and use it to generate the options
    $.get('options.html', function (data) {

        // Use the checkbox's value attribute as the key and default value
        $('input[type="checkbox"]', data).each(function () {
            var val = $(this).attr('value'),
                key = 'buffer.op.' + val;

            localStorage.setItem(key, val);
        });

        // Use any text input's placeholder as the value,
        // and the name as the key
        $('input[type="text"]', data).each(function () {
            var val = $(this).attr('placeholder'),
                key = 'buffer.op.' + $(this).attr('name');

            localStorage.setItem(key, val);
        });

    });
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
var ports = [];
var overlayPort, scraperPort;
chrome.extension.onConnect.addListener(function(chport) {
    
    if( chport.name !== "buffer-embed" ) return;

    var port = PortWrapper(chport);
    var index = ports.push(port);
    var tab = port.raw.sender.tab;

    port.emit('buffer_options', localStorage);
    
    // Listen for embedded triggers
    port.on("buffer_click", function (embed) {
        attachOverlay({tab: tab, embed: embed}, function (overlaydata) {
            if( !!overlaydata.sent ) {
                // Buffer was sent
                port.emit("buffer_embed_clear");
            }
        });
    });

    // Listen for a request for scraper data
    port.on("buffer_details_request", function () {
        overlayPort = port;
        if( scraperPort ) {
            scraperPort.emit("buffer_details_request");
        }
    });

    port.on("buffer_details", function (data) {
        if( overlayPort ) overlayPort.emit("buffer_details", data);
    });

    port.on("buffer_register_scraper", function () {
        scraperPort = port;
    });


});
