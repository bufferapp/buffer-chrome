if( ! xt.port.raw ) {
  xt.port = PortWrapper(chrome.extension.connect({name: "buffer-embed"}));
  // Maintain the connection
  setInterval(function () {
    xt.port = PortWrapper(chrome.extension.connect({name: "buffer-embed"}));
  }, 1000 * 1);
  // Get options
  xt.port.on('buffer_options', function (options) {
    xt.options = options;
  });
}
