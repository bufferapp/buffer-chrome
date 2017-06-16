/**
 * Testing a nested iframe approach to avoid CSP issues.
 * More info: https://github.com/bufferapp/buffer-chrome/issues/12
 *
 * Need to be added to manifest.json under "web_accessible_resources":
 *   "data/shared/extension.html"
 *   "data/shared/nested-iframe.js"
 */
var qs = window.location.search;
var iframe = document.createElement('iframe');
iframe.src = 'https://buffer.com/add' + qs;
document.body.appendChild(iframe);
//TODO - Need to add postMessage communication between this iframe and parent page
