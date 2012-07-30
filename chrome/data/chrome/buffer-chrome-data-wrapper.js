// Very small wrapper for getting a data URL
var DataWrapper = function () {
  return {
    get: function (file) {
      return chrome.extension.getURL(file);
    }
  };
};

if(!xt) var xt = {};
xt.data = DataWrapper();