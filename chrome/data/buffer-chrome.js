chrome.extension.onConnect.addListener(function(ffport) {

    var port = PortWrapper(ffport);
    
    port.emit("hello", "World!");
  
});