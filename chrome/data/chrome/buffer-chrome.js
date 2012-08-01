;(function() {
  chrome.extension.onConnect.addListener(function(rawPort) {
    // PortWrapper(port) exposes an on/emit API for Chrome ports.
    // We are waiting for a trigger, buffer_click, to create the overlay.
    var port = PortWrapper(rawPort);
    port.on("buffer_click", function(postData) {
      // bufferData is a method in buffer-overlay that creates
      // the overlay and gives it data.
      bufferData(port, postData);
    });
  });
}());