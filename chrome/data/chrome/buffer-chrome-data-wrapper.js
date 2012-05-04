var DataWrapper = function () {
    
    return {
        get: function (file) {
            return chrome.extension.getURL(file);
        }
    }
    
};

if(!self) var self = {};
self.data = DataWrapper();