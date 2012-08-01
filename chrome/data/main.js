/*

Buffer for Chrome

*/

/**=========================================
 * CONFIGURATION
 =========================================*/

// Add manifest access to the extension
chrome.manifest = chrome.app.getDetails();

var config = {};
config.plugin = {
    label: "Buffer This Page",
    version: chrome.manifest.version,
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

/**=========================================
 * OVERLAY & TAB MANAGEMENT
 =========================================*/

var tabs = [];

// Trigger buffer_click in the content scripts,
// so that an overlay is created
var attachOverlay = function (data, cb) {
    
    // Make sure all the data is in the right place
    if( typeof data === 'function' ) cb = data;
    if( ! data ) data = {};
    if( ! cb ) cb = function () {};
    if( ! data.embed ) data.embed = {};
    
    // Store references to important data
    var tab = data.tab;
    var port = PortWrapper(chrome.tabs.connect(tab.id), {name: 'buffer'});

    // Remove the port once the Buffering is complete
    port.on('buffer_done', function (overlayData) {
        cb(overlayData);
    });
    
    // Don't try to JSON encode a tab
    data.tab = null;

    // Pass statistic data
    data.version = config.plugin.version;
	if( data.embed.placement ) data.placement = data.embed.placement;

    // Inform overlay that click has occurred
    port.emit("buffer_click", data);
};

/**=========================================
 * CONTENT SCRIPT PORT
 =========================================*/

// Listen for embedded events
chrome.extension.onConnect.addListener(function(rawPort) {
    
    // Ignore anything that doesn't begin with Buffer
    if( ! rawPort.name.match(/^buffer/) ) { return; }

    var port = PortWrapper(rawPort),
        tab = rawPort.sender.tab;

    tabs[tab.id] = port;

    // Send the user's options to content scripts
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

    // Listen for a request for scraper data from the overlay-scraper
    // and send it on to the scraper
    port.on("buffer_details_request", function () {
        port.emit("buffer_details_request");
    });

    // overlay-scraper asks for details, then the scraper
    // return it, so we send it back to the overlay-scraper
    port.on("buffer_details", function (data) {
        port.emit("buffer_details", data);
    });

});

/**=========================================
 * INITIAL SETUP
 =========================================*/

var injectButtonCode = function (id) {
    var scripts = chrome.manifest.content_scripts[0].js;
    scripts.forEach(function (script) {
        chrome.tabs.executeScript(id, {
            file: script
        });
    });
};

// Show the guide on first run
if( ! localStorage.getItem('buffer.run') ) {
    localStorage.setItem('buffer.run', true);
    // Inject the scraper scripts into all tabs in all windows straight away
    chrome.windows.getAll({
        populate: true
    }, function (windows) {
        windows.forEach(function (currentWindow) {
            currentWindow.tabs.forEach(function (currentTab) {
                // Skip chrome:// and https:// pages
                if( ! currentTab.url.match(/(chrome|https):\/\//gi) ) {
                    injectButtonCode(currentTab.id);
                }
            });
        });
        // Open the guide
        chrome.tabs.create({
            url: config.plugin.guide,
            active: true
        });
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

/**=========================================
 * TRIGGERS
 =========================================*/

// Fire the overlay when the browser action button is clicked
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

// Selection
chrome.contextMenus.create({
    title: config.plugin.menu.image.label,
    contexts: ["image"],
    onclick: function (info, tab) {
        attachOverlay({
            tab: tab,
            image: info.srcUrl,
            placement: 'menu-image'
        });
    }
});
