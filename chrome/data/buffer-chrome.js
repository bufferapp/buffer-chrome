$(function() {
    chrome.extension.onConnect.addListener(function(chport) {
        
        self.port = PortWrapper(chport);
        
        self.port.on("buffer_click", function() {
            bufferData();
        });
  
    });
});