/* globals chrome, safari */
// buffer-install-check.js
// (c) 2013 Buffer
// Adds an element to our app page that we can use to check if the browser has our extension installed.

var bufferMarkOurSite = function (version) {
	if (window.top !== window) return;

	if (document.location.host.match(/buffer.com/i) ||
      document.location.host.match(/bufferapp.com/i)) {

    var marker = document.querySelector('#browser-extension-marker');
    if (!marker) return;

    marker.setAttribute('data-version', version);

    // Trigger a click to let the app know we have the version:
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent('click', true, true );
    marker.dispatchEvent(evt);
	}
};

// Chrome doesn't expose the version so easily with the permissions
// we currently require, so we xhr for the manifest file to get the version.
function getVersionForChrome(callback) {

  var xhr = new XMLHttpRequest();
  xhr.open('GET', chrome.extension.getURL('/manifest.json'));
  xhr.onload = function (e) {
    var manifest = JSON.parse(xhr.responseText);
    callback(manifest.version);
  }
  xhr.send(null);
}

function getVersionForSafari(callback) {
  xt.port.on('buffer_send_extesion_info', function(data){
    callback(data.version);
  });
  xt.port.emit('buffer_get_extesion_info');
}

if (typeof chrome !== 'undefined') {
  getVersionForChrome(bufferMarkOurSite);
} else if (typeof safari !== 'undefined'){
  getVersionForSafari(bufferMarkOurSite);
}

