var iframe;

function initFrame() {
  iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
}

// Listen to the parent window send src info to be set on the nested frame
function receiveNestedFrameData() {
  var handler = function(e) {
    if (e.source !== window.parent && !e.data.src) return;

    iframe.src = e.data.src;
    iframe.style.cssText = e.data.css;
    window.removeEventListener('message', handler);
  };

  window.addEventListener('message', handler);
}

// Listen to messages from nested frame and pass them up the window stack
function setupMessageRelay() {
  window.addEventListener('message', function(e) {
    var origin = e.origin || e.originalEvent.origin;
    if (origin !== 'https://buffer.com' || e.source !== iframe.contentWindow) {
      return;
    }

    window.parent.postMessage(e.data, '*');
  });
}

initFrame();
receiveNestedFrameData();
setupMessageRelay();
