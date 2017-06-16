/* globals jQuery */
/**
 The MIT License

 Copyright (c) 2010 Daniel Park (http://metaweb.com, http://postmessage.freebaseapps.com)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 **/
var NO_JQUERY = {};
(function(window, $, undefined) {

  if (!("console" in window)) {
    var c = window.console = {};
    c.log = c.warn = c.error = c.debug = function(){};
  }

  if ($ === NO_JQUERY) {
    // jQuery is optional
    $ = {
      fn: {},
      extend: function() {
        var a = arguments[0];
        for (var i=1,len=arguments.length; i<len; i++) {
          var b = arguments[i];
          for (var prop in b) {
            a[prop] = b[prop];
          }
        }
        return a;
      }
    };
  }

  $.fn.pm = function() {
    console.log("usage: \nto send:    $.pm(options)\nto receive: $.pm.bind(type, fn, [origin])");
    return this;
  };

  // send postmessage
  $.pm = window.bufferpm = function(options) {
    bufferpm.send(options);
  };

  // bind postmessage handler
  $.pm.bind = window.bufferpm.bind = function(type, fn, origin, hash) {
    bufferpm.bind(type, fn, origin, hash);
  };

  // unbind postmessage handler
  $.pm.unbind = window.bufferpm.unbind = function(type, fn) {
    bufferpm.unbind(type, fn);
  };

  // default postmessage origin on bind
  $.pm.origin = window.bufferpm.origin = null;

  // default postmessage polling if using location hash to pass postmessages
  $.pm.poll = window.bufferpm.poll = 200;

  var bufferpm = {

    send: function(options) {
      var o = $.extend({}, bufferpm.defaults, options),
      target = o.target;
      if (!o.target) {
        console.warn("postmessage target window required");
        return;
      }
      if (!o.type) {
        /*console.warn("postmessage type required");*/
        return;
      }
      var msg = {data:o.data, type:o.type};
      if (o.success) {
        msg.callback = bufferpm._callback(o.success);
      }
      if (o.error) {
        msg.errback = bufferpm._callback(o.error);
      }
      if (("postMessage" in target) && !o.hash) {
        bufferpm._bind();
        target.postMessage(JSON.stringify(msg), o.origin || '*');
      }
      else {
        bufferpm.hash._bind();
        bufferpm.hash.send(o, msg);
      }
    },

    bind: function(type, fn, origin, hash) {
      if (("postMessage" in window) && !hash) {
        bufferpm._bind();
      }
      else {
        bufferpm.hash._bind();
      }
      var l = bufferpm.data("listeners.postmessage");
      if (!l) {
        l = {};
        bufferpm.data("listeners.postmessage", l);
      }
      var fns = l[type];
      if (!fns) {
        fns = [];
        l[type] = fns;
      }
      fns.push({fn:fn, origin:origin || $.pm.origin});
    },

    unbind: function(type, fn) {
      var l = bufferpm.data("listeners.postmessage");
      if (l) {
        if (type) {
          if (fn) {
            // remove specific listener
            var fns = l[type];
            if (fns) {
              var m = [];
              for (var i=0,len=fns.length; i<len; i++) {
                var o = fns[i];
                if (o.fn !== fn) {
                  m.push(o);
                }
              }
              l[type] = m;
            }
          }
          else {
            // remove all listeners by type
            delete l[type];
          }
        }
        else {
          // unbind all listeners of all type
          for (var j in l) {
            delete l[j];
          }
        }
      }
    },

    data: function(k, v) {
      if (v === undefined) {
        return bufferpm._data[k];
      }
      bufferpm._data[k] = v;
      return v;
    },

    _data: {},

    _CHARS: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),

    _random: function() {
      var r = [];
      for (var i=0; i<32; i++) {
        r[i] = bufferpm._CHARS[0 | Math.random() * 32];
      }
      return r.join("");
    },

    _callback: function(fn) {
      var cbs = bufferpm.data("callbacks.postmessage");
      if (!cbs) {
        cbs = {};
        bufferpm.data("callbacks.postmessage", cbs);
      }
      var r = bufferpm._random();
      cbs[r] = fn;
      return r;
    },

    _bind: function() {
      // are we already listening to message events on this w?
      if (!bufferpm.data("listening.postmessage")) {
        if (window.addEventListener) {
          window.addEventListener("message", bufferpm._dispatch, false);
        }
        else if (window.attachEvent) {
          window.attachEvent("onmessage", bufferpm._dispatch);
        }
        bufferpm.data("listening.postmessage", 1);
      }
    },

    _dispatch: function(e) {
      var msg;
      try {
        msg = JSON.parse(e.data);
      }
      catch (ex) {
        /*console.warn("postmessage data invalid json: ", ex);*/
        return;
      }
      if (!msg.type) {
        /*console.warn("postmessage message type required");*/
        return;
      }
      var cbs = bufferpm.data("callbacks.postmessage") || {},
      cb = cbs[msg.type];
      if (cb) {
        cb(msg.data);
      }
      else {
        var l = bufferpm.data("listeners.postmessage") || {};
        var fns = l[msg.type] || [];
        for (var i=0,len=fns.length; i<len; i++) {
          var o = fns[i];
          if (o.origin && e.origin !== o.origin) {
            console.warn("postmessage message origin mismatch", e.origin, o.origin);
            if (msg.errback) {
              // notify post message errback
              var error = {
                message: "postmessage origin mismatch",
                origin: [e.origin, o.origin]
              };
              bufferpm.send({target:e.source, data:error, type:msg.errback});
            }
            continue;
          }
          try {
            var r = o.fn(msg.data);
            if (msg.callback) {
              bufferpm.send({target:e.source, data:r, type:msg.callback});
            }
          }
          catch (ex) {
            if (msg.errback) {
              // notify post message errback
              bufferpm.send({target:e.source, data:ex, type:msg.errback});
            }
          }
        }
      }
    }
  };

  // location hash polling
  bufferpm.hash = {

    send: function(options, msg) {
      //console.log("hash.send", target_window, options, msg);
      var target_window = options.target,
      target_url = options.url;
      if (!target_url) {
        console.warn("postmessage target window url is required");
        return;
      }
      target_url = bufferpm.hash._url(target_url);
      var source_window,
      source_url = bufferpm.hash._url(window.location.href);
      if (window == target_window.parent) {
        source_window = "parent";
      }
      else {
        try {
          for (var i=0,len=parent.frames.length; i<len; i++) {
            var f = parent.frames[i];
            if (f == window) {
              source_window = i;
              break;
            }
          }
        }
        catch(ex) {
          // Opera: security error trying to access parent.frames x-origin
          // juse use window.name
          source_window = window.name;
        }
      }
      if (source_window == null) {
        console.warn("postmessage windows must be direct parent/child windows and the child must be available through the parent window.frames list");
        return;
      }
      var hashmessage = {
        "x-requested-with": "postmessage",
        source: {
          name: source_window,
          url: source_url
        },
        postmessage: msg
      };
      var hash_id = "#x-postmessage-id=" + bufferpm._random();
      target_window.location = target_url + hash_id + encodeURIComponent(JSON.stringify(hashmessage));
    },

    _regex: /^\#x\-postmessage\-id\=(\w{32})/,

    _regex_len: "#x-postmessage-id=".length + 32,

    _bind: function() {
      // are we already listening to message events on this w?
      if (!bufferpm.data("polling.postmessage")) {
        setInterval(function() {
                var hash = "" + window.location.hash,
                m = bufferpm.hash._regex.exec(hash);
                if (m) {
                  var id = m[1];
                  if (bufferpm.hash._last !== id) {
                    bufferpm.hash._last = id;
                    bufferpm.hash._dispatch(hash.substring(bufferpm.hash._regex_len));
                  }
                }
              }, $.pm.poll || 200);
        bufferpm.data("polling.postmessage", 1);
      }
    },

    _dispatch: function(hash) {
      if (!hash) {
        return;
      }
      try {
        hash = JSON.parse(decodeURIComponent(hash));
        if (!(hash['x-requested-with'] === 'postmessage' &&
            hash.source && hash.source.name != null && hash.source.url && hash.postmessage)) {
          // ignore since hash could've come from somewhere else
          return;
        }
      }
      catch (ex) {
        // ignore since hash could've come from somewhere else
        return;
      }
      var msg = hash.postmessage,
      cbs = bufferpm.data("callbacks.postmessage") || {},
      cb = cbs[msg.type];
      if (cb) {
        cb(msg.data);
      }
      else {
        var source_window;
        if (hash.source.name === "parent") {
          source_window = window.parent;
        }
        else {
          source_window = window.frames[hash.source.name];
        }
        var l = bufferpm.data("listeners.postmessage") || {};
        var fns = l[msg.type] || [];
        for (var i=0,len=fns.length; i<len; i++) {
          var o = fns[i];
          if (o.origin) {
            var origin = /https?\:\/\/[^\/]*/.exec(hash.source.url)[0];
            if (origin !== o.origin) {
              console.warn("postmessage message origin mismatch", origin, o.origin);
              if (msg.errback) {
                // notify post message errback
                var error = {
                  message: "postmessage origin mismatch",
                  origin: [origin, o.origin]
                };
                bufferpm.send({target:source_window, data:error, type:msg.errback, hash:true, url:hash.source.url});
              }
              continue;
            }
          }
          try {
            var r = o.fn(msg.data);
            if (msg.callback) {
              bufferpm.send({target:source_window, data:r, type:msg.callback, hash:true, url:hash.source.url});
            }
          }
          catch (ex) {
            if (msg.errback) {
              // notify post message errback
              bufferpm.send({target:source_window, data:ex, type:msg.errback, hash:true, url:hash.source.url});
            }
          }
        }
      }
    },

    _url: function(url) {
      // url minus hash part
      return (""+url).replace(/#.*$/, "");
    }

  };

  $.extend(bufferpm, {
    defaults: {
      target: null,  /* target window (required) */
      url: null,     /* target window url (required if no window.postMessage or hash == true) */
      type: null,    /* message type (required) */
      data: null,    /* message data (required) */
      success: null, /* success callback (optional) */
      error: null,   /* error callback (optional) */
      origin: "*",   /* postmessage origin (optional) */
      hash: false    /* use location hash for message passing (optional) */
    }
  });

})(this, typeof jQuery === "undefined" ? NO_JQUERY : jQuery);
