;(function() {
  // buffer-chrome sets up the listener for "buffer_click" that
  // makes the overlay appear after Buffer is triggered from an
  // external source lick the browser action or a retweet in Twitter
  chrome.extension.onConnect.addListener(function(chport) {
    // The PortWapper creates the on/emit API for the port
    var overlayPort = PortWrapper(chport);
    overlayPort.on("buffer_click", function(postData) {
      // bufferData is a method created in buffer-overlay that creates
      // the overlay and gives it data
      bufferData(overlayPort, postData);
    });
  });
}());