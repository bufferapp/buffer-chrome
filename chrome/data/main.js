/* globals chrome, PortWrapper, _bmq */
/**=========================================
 * Buffer for Chrome/Firefox
 *
 * How it works:
 *
 * 1.  Content scripts are injected according to the list in
 *     the manifest.
 * 2.  As each script is injected, a connection is set up
 *     and the chrome.runtime.onConnectlistener is fired.
 * 3.  This creates listeners for events from the content
 *     script, which can be triggers or data passing.
 * 4.  When a trigger (buffer_click) is fired, from a content
 *     script or from a page action or menu, the attachOverlay
 *     function is fired, which initiates a connection to the
 *     buffer-overlay content script, collates some data and
 *     fires an event that triggers the creation of the Buffer
 *     overlay.
 *
 * The shared embeds:
 *
 * The embed code (shared/...) is identical across the extensions.
 * They are injected with some or all of the contents of chrome/...
 * to allow them to run the same code across all three+ browsers.
 *
 * The scripts that hack on other's UI do so by defining a list of
 * objects that are processed and converted in DOM elements with
 * event listeners and style etc.
 *
 * For example, in buffer-twitter:
 *
 * config.buttons is the list of elements that are added to the UI.
 * The element, built in the create method, is added to the container
 * elements, after another specific element. It's not quite consistent
 * between the embedded scripts, so it's worth checking out the
 * insertButtons function to see what's possible.
 *
 * I started to extract this out into a library, but there didn't seem
 * to be demand for it so I stopped. https://github.com/phuu/extensio
 =========================================*/

/**=========================================
 * CONFIGURATION
 =========================================*/

var currentBrowser = (
  location.protocol === 'chrome-extension:' ? 'chrome' :
  location.protocol === 'moz-extension:' ? 'firefox' : ''
);

// Add manifest access to the extension
chrome.manifest = chrome.runtime.getManifest();

// Plugin configuration
var config = {};
config.plugin = {
  label: "Buffer This Page",
  browser: currentBrowser,
  version: chrome.manifest.version,
  guide: 'https://buffer.com/guides/' + currentBrowser + '/installed',
  menu: {
    page: {
      label: "Buffer This Page"
    },
    selection: {
      label: "Buffer Selected Text"
    },
    pablo_selection: {
      label: "Create Image With Pablo"
    },
    image: {
      label: "Buffer This Image"
    },
    pablo_image: {
      label: "Open Image With Pablo"
    }
  },
};

/**=========================================
 * OVERLAY & TAB MANAGEMENT
 =========================================*/
var extensionUserData = JSON.parse(localStorage.getItem('buffer.extensionUserData'));

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

  // frameId is supported since Chrome 41, and it apparently throws in prev. versions.
  // frameId fixes an issue that appeared in 45 where Chrome sends a message to all tabs
  // sharing a same opener tab and that opener tab itself (e.g. when using window.open)
  try {
    var rawPort = chrome.tabs.connect(tab.id, { name: 'buffer', frameId: 0 });
  } catch(e) {
    var rawPort = chrome.tabs.connect(tab.id, { name: 'buffer' });
  }
  var port = PortWrapper(rawPort);

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

  // Listen to overlay asking to open a popup from privileged code
  // to bypass CSP on some sites
  port.on('buffer_open_popup', function(options) {
    var url = options.src;
    var isSmallPopup = !!options.isSmallPopup;

    if (isSmallPopup) {
      chrome.windows.getCurrent({}, function(currentWindow) {
        var popupWidth = Math.min(740, currentWindow.width);
        var popupHeight = Math.min(700, currentWindow.height);
        var popupLeft = Math.round((currentWindow.width - popupWidth) / 2);
        var popupTop = Math.round((currentWindow.height - popupHeight) / 2);

        chrome.windows.create({
          url: url, type: 'popup', width: popupWidth, height: popupHeight, top: popupTop, left: popupLeft
        });
      });
    } else {
      // Firefox currently doesn't support the openerTabId option and throws on it
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=1238314
      if (currentBrowser === 'firefox') chrome.tabs.create({ url: url });
      else chrome.tabs.create({ url: url, openerTabId: tab.id });
    }
  });

  // Map content script _bmq calls to the real _bmq here
  port.on('buffer_tracking', function(payload) {
    _bmq[payload.methodName].apply(_bmq, payload.args);
  });

  // Send cached user data to overlay when it opens up
  if (extensionUserData) {
    port.on('buffer_overlay_open', function() {
      port.emit('buffer_user_data', extensionUserData);
    });
  }

  // Listen for user data from buffer-overlay, and cache it here
  port.on('buffer_user_data', function(userData) {
    extensionUserData = userData;
    localStorage.setItem('buffer.extensionUserData', JSON.stringify(extensionUserData));
    port.emit('buffer_user_data', extensionUserData);
  });
};

/**=========================================
 * CONTENT SCRIPT PORT
 =========================================*/

// Listen for embedded events
chrome.runtime.onConnect.addListener(function(rawPort) {

  // Ignore anything that doesn't begin with Buffer
  if( ! rawPort.name.match(/^buffer/) ) { return; }

  var port = PortWrapper(rawPort),
    tab = rawPort.sender.tab;

  // Send the user's options to content scripts
  port.emit('buffer_options', Object.assign({}, localStorage));

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

  // Open the settings options.html in a new tab
  port.on("buffer_open_settings", function () {
    chrome.tabs.create({
      url: 'options.html#newtab',
      index: tab.index + 1
    });
  });
});

// Using chrome.runtime.sendMessage/onMessage because we need access to the sender,
// and Firefox currently doesn't pass the sender alonside the payload when using ports
// for messaging
chrome.runtime.onMessage.addListener(function(data, sender) {
  if (data.type === 'buffer_close_popup') {
    chrome.tabs.remove(sender.tab.id);
  }
});

/**=========================================
 * INITIAL SETUP
 =========================================*/

// Inject code from the first element of the content script list
var injectButtonCode = function (id) {
  var scripts = chrome.manifest.content_scripts[0].js;
  // Programmatically inject each script
  scripts.forEach(function (script) {
    chrome.tabs.executeScript(id, {
      file: script
    });
  });
};

if (chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(function(details){
    if (details.reason == "install"){
      chrome.windows.getAll({
        populate: true
      }, function (windows) {
        windows.forEach(function (currentWindow) {
          currentWindow.tabs.forEach(function (currentTab) {
            // Skip chrome://, about:, and https:// pages
            if(!currentTab.url.match(/^(?:chrome|about|https):/gi) ) {
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
    } else if (details.reason == "update"){
      // Nothing to do here, yet...
    }
  });
}

// Set up options
if( ! localStorage.getItem('buffer.op') ) {
  localStorage.setItem('buffer.op', true);

  // Grab the options page and use it to generate the options
  $.get(chrome.extension.getURL('options.html'), function (data) {

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

  }, 'html');
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

// Pablo Selection
chrome.contextMenus.create({
  title: config.plugin.menu.pablo_selection.label,
  contexts: ["selection"],
  onclick: function (info, tab) {
    chrome.tabs.create({ url: 'https://buffer.com/pablo?text=' + encodeURIComponent(info.selectionText) + '&source_url=' + encodeURIComponent(info.pageUrl) });
  }
});

// Image
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


// Pablo Image
chrome.contextMenus.create({
  title: config.plugin.menu.pablo_image.label,
  contexts: ["image"],
  onclick: function(info, tab) {
    chrome.tabs.create({ url: 'https://buffer.com/pablo?image=' + encodeURIComponent(info.srcUrl) + '&source_url=' + encodeURIComponent(info.pageUrl) });
  }
});
