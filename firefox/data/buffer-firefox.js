// Buffer for Firefox
// Firefox-specific code
//$(function () {
    
    var config = {};
    config.attributes = [
        {
            name: "url",
            get: function (cb) {
                cb(window.location.href);
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        },
        {
            name: "text",
            get: function (cb) {
                if(document.getSelection() != false) cb('"' + document.getSelection().toString() + '"');
                else cb(document.title);
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        },
        {
            name: "picture",
            get: function (cb) {
                self.port.on("buffer_image", function(data) {
                    cb(data);
                });
                self.port.emit("buffer_get_image");
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        },
        {
            name: "tweet",
            get: function (cb) {
                self.port.on("buffer_tweet", function(data) {
                    cb(data);
                });
                self.port.emit("buffer_get_tweet");
            },
            encode: function (val) {
                return encodeURIComponent(val);
            }
        }
    ];
    config.overlay = {
        endpoint: 'http://bufferapp.com/bookmarklet/',
        localendpoint: 'http://local.bufferapp.com/bookmarklet/',
        getCSS: function () { return "border:none;height:100%;width:100%;position:fixed;z-index:99999999;top:0;left:0;"; }
    };
    
    var executeAfter = function(done, count, data, cb) {
        if(done === count) {
            setTimeout(function(){
                cb(data)
            }, 0);
        }
    };
   
    var getData = function (cb) {
        var count = config.attributes.length;
        var done = 0;
        var data = {};
        for(var i=0; i < count; i++) {
            var a = config.attributes[i];
            a.get(function(d) {
                done += 1;
                data[a.name] = d;
                executeAfter(done, count, data, cb);
            });
        }
    };
   
    var createOverlay = function (data) {
        var count = config.attributes.length;
        for(var i=0; i < count; i++) {
            var a = config.attributes[i];
            console.log(a.name, " : ", data[a.name]);
        }
        bufferOverlay(data, config, function () {
            self.port.emit("buffer_done");
        });
    };
    
    getData(createOverlay);
    
//});