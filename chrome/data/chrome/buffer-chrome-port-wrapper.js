/**
* PortWrapper adds an on/emit API to the Chrome ports
* to make them work more like Firefox ports.
*
* port - a Chrome Port object
* name - string identifier for the port
*
* Returns an object with .on/.emit for acting on messages from
* the other aspect of the extension (background page or content script)
*/
var PortWrapper = function (port, name) {

  var sub = {};
  var disconnected = false;

  // Listen for all messages and fire the callbacks
  // for the associated listeners
  port.onMessage.addListener(function (data) {

    if( !sub[data.type] ) return;

    sub[data.type].forEach(function (subscriber) {
      subscriber(data.payload);
    });

  });

  port.onDisconnect.addListener(function () {
    disconnected = true;
  });

  return {
    on: function (type, cb) {
      // Add the subscriber to the list
      // The Ruby ||= operator would be nice here!
      if( !sub[type] ) sub[type] = [];
      sub[type].push(cb);
    },
    emit: function(type, payload) {
      // Post a message to through the port
      // with a type and a data payloard
      //
      // The payload should be JSON serializable
      if( disconnected ) return;
      port.postMessage({
        type: type,
        payload: payload
      });
    },
    sub: function () { return sub; },
    destroy: function () {
      sub = {};
      port = null;
    },
    name: port.name,
    raw: port
  };

};

if(!xt) var xt = {};
xt.port = {
  on: function () {console.log("port.on called before initialised.", arguments);},
  emit: function () {console.log("port.emit called before initialised.", arguments);}
};