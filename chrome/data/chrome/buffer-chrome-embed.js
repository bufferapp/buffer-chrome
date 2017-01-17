;(function () {

  // Don't try and connect again if xt.port.raw has already been set
  if( ! xt.port.raw ) {

    var rawPort;

    // Attempt to reconnect
    var reconnectToExtension = function () {
      // Reset port
      rawPort = null;

      // Attempt to reconnect after 1 second
      setTimeout(connectToExtension, 1000 * 1);
    };

    // Attempt to connect
    var connectToExtension = function () {

      // Make the connection
      rawPort = chrome.runtime.connect({name: "buffer-embed"});

      // When extension is upgraded or disabled and renabled, the content scripts
      // will still be injected, so we have to reconnect them.
      // We listen for an onDisconnect event, and then wait for a second before
      // trying to connect again. Because chrome.runtime.connect fires an onDisconnect
      // event if it does not connect, an unsuccessful connection should trigger
      // another attempt, 1 second later.
      rawPort.onDisconnect.addListener(reconnectToExtension);

      // Wrap it up for use by the content scripts
      xt.port = PortWrapper(rawPort);

      // Wait for options
      xt.port.on('buffer_options', function (options) {
        xt.options = options;
      });
    };

    // Connect for the first time
    connectToExtension();
  }

}());
