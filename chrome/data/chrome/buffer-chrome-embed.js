if( ! xt.port.raw ) {
  xt.port = PortWrapper(chrome.extension.connect({name: "buffer-embed"}));
  xt.port.on('buffer_options', function (options) {
    xt.options = options;
  });
}
