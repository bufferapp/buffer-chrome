
/* Libraries */
// postMessage http://postmessage.freebaseapps.com/
var NO_JQUERY={};(function(a,b,c){if(!("console"in a)){var d=a.console={};d.log=d.warn=d.error=d.debug=function(){}}if(b===NO_JQUERY){b={fn:{},extend:function(){var a=arguments[0];for(var b=1,c=arguments.length;b<c;b++){var d=arguments[b];for(var e in d){a[e]=d[e]}}return a}}}b.fn.pm=function(){console.log("usage: \nto send:    $.pm(options)\nto receive: $.pm.bind(type, fn, [origin])");return this};b.pm=a.bufferpm=function(a){e.send(a)};b.pm.bind=a.bufferpm.bind=function(a,b,c,d){e.bind(a,b,c,d)};b.pm.unbind=a.bufferpm.unbind=function(a,b){e.unbind(a,b)};b.pm.origin=a.bufferpm.origin=null;b.pm.poll=a.bufferpm.poll=200;var e={send:function(a){var c=b.extend({},e.defaults,a),d=c.target;if(!c.target){console.warn("postmessage target window required");return}if(!c.type){console.warn("postmessage type required");return}var f={data:c.data,type:c.type};if(c.success){f.callback=e._callback(c.success)}if(c.error){f.errback=e._callback(c.error)}if("postMessage"in d&&!c.hash){e._bind();d.postMessage(JSON.stringify(f),c.origin||"*")}else{e.hash._bind();e.hash.send(c,f)}},bind:function(c,d,f,g){if("postMessage"in a&&!g){e._bind()}else{e.hash._bind()}var h=e.data("listeners.postmessage");if(!h){h={};e.data("listeners.postmessage",h)}var i=h[c];if(!i){i=[];h[c]=i}i.push({fn:d,origin:f||b.pm.origin})},unbind:function(a,b){var c=e.data("listeners.postmessage");if(c){if(a){if(b){var d=c[a];if(d){var f=[];for(var g=0,h=d.length;g<h;g++){var i=d[g];if(i.fn!==b){f.push(i)}}c[a]=f}}else{delete c[a]}}else{for(var g in c){delete c[g]}}}},data:function(a,b){if(b===c){return e._data[a]}e._data[a]=b;return b},_data:{},_CHARS:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),_random:function(){var a=[];for(var b=0;b<32;b++){a[b]=e._CHARS[0|Math.random()*32]}return a.join("")},_callback:function(a){var b=e.data("callbacks.postmessage");if(!b){b={};e.data("callbacks.postmessage",b)}var c=e._random();b[c]=a;return c},_bind:function(){if(!e.data("listening.postmessage")){if(a.addEventListener){a.addEventListener("message",e._dispatch,false)}else if(a.attachEvent){a.attachEvent("onmessage",e._dispatch)}e.data("listening.postmessage",1)}},_dispatch:function(a){try{var b=JSON.parse(a.data)}catch(c){console.warn("postmessage data invalid json: ",c);return}if(!b.type){console.warn("postmessage message type required");return}var d=e.data("callbacks.postmessage")||{},f=d[b.type];if(f){f(b.data)}else{var g=e.data("listeners.postmessage")||{};var h=g[b.type]||[];for(var i=0,j=h.length;i<j;i++){var k=h[i];if(k.origin&&a.origin!==k.origin){console.warn("postmessage message origin mismatch",a.origin,k.origin);if(b.errback){var l={message:"postmessage origin mismatch",origin:[a.origin,k.origin]};e.send({target:a.source,data:l,type:b.errback})}continue}try{var m=k.fn(b.data);if(b.callback){e.send({target:a.source,data:m,type:b.callback})}}catch(c){if(b.errback){e.send({target:a.source,data:c,type:b.errback})}}}}}};e.hash={send:function(b,c){var d=b.target,f=b.url;if(!f){console.warn("postmessage target window url is required");return}f=e.hash._url(f);var g,h=e.hash._url(a.location.href);if(a==d.parent){g="parent"}else{try{for(var i=0,j=parent.frames.length;i<j;i++){var k=parent.frames[i];if(k==a){g=i;break}}}catch(l){g=a.name}}if(g==null){console.warn("postmessage windows must be direct parent/child windows and the child must be available through the parent window.frames list");return}var m={"x-requested-with":"postmessage",source:{name:g,url:h},postmessage:c};var n="#x-postmessage-id="+e._random();d.location=f+n+encodeURIComponent(JSON.stringify(m))},_regex:/^\#x\-postmessage\-id\=(\w{32})/,_regex_len:"#x-postmessage-id=".length+32,_bind:function(){if(!e.data("polling.postmessage")){setInterval(function(){var b=""+a.location.hash,c=e.hash._regex.exec(b);if(c){var d=c[1];if(e.hash._last!==d){e.hash._last=d;e.hash._dispatch(b.substring(e.hash._regex_len))}}},b.pm.poll||200);e.data("polling.postmessage",1)}},_dispatch:function(b){if(!b){return}try{b=JSON.parse(decodeURIComponent(b));if(!(b["x-requested-with"]==="postmessage"&&b.source&&b.source.name!=null&&b.source.url&&b.postmessage)){return}}catch(c){return}var d=b.postmessage,f=e.data("callbacks.postmessage")||{},g=f[d.type];if(g){g(d.data)}else{var h;if(b.source.name==="parent"){h=a.parent}else{h=a.frames[b.source.name]}var i=e.data("listeners.postmessage")||{};var j=i[d.type]||[];for(var k=0,l=j.length;k<l;k++){var m=j[k];if(m.origin){var n=/https?\:\/\/[^\/]*/.exec(b.source.url)[0];if(n!==m.origin){console.warn("postmessage message origin mismatch",n,m.origin);if(d.errback){var o={message:"postmessage origin mismatch",origin:[n,m.origin]};e.send({target:h,data:o,type:d.errback,hash:true,url:b.source.url})}continue}}try{var p=m.fn(d.data);if(d.callback){e.send({target:h,data:p,type:d.callback,hash:true,url:b.source.url})}}catch(c){if(d.errback){e.send({target:h,data:c,type:d.errback,hash:true,url:b.source.url})}}}}},_url:function(a){return(""+a).replace(/#.*$/,"")}};b.extend(e,{defaults:{target:null,url:null,type:null,data:null,success:null,error:null,origin:"*",hash:false}})})(this,typeof jQuery==="undefined"?NO_JQUERY:jQuery)

var config = {};
config.attributes = [
    {
        name: "url",
        encode: function (val) {
            return encodeURIComponent(val);
        }
    },
    {
        name: "text",
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

// Listen for events
self.port.on("buffer_data", function(data) {
    OverlayIframe(data, function() {});
});

var OverlayIframe = function(data, doneCallback) {
    
    var buildSrc = function() {
        var src = config.overlay.endpoint;
        if(data.local) src = config.overlay.localendpoint;
        
        // Add button attributes
        var first = true, count = 0;
        for(var i=0, l=config.attributes.length; i < l; i++) {
            var a = config.attributes[i];
            if( ! data[a.name] ) continue;
            if( first ) { src += '?'; first = false; }
            count += 1;
            if( count > 1 ) src += '&';
            src += a.name + '=' + a.encode(data[a.name])
        }
        
        return src;
    };
    
    var temp = document.createElement('iframe');
    
    temp.allowtransparency = 'true';
	temp.scrolling = 'no';
	temp.id = 'buffer_overlay';
	temp.name = 'buffer_overlay';
	temp.style.cssText = config.overlay.getCSS();
	
	temp.src = buildSrc();
	
	document.body.appendChild(temp);
    
    // Bind close listener
	bufferpm.bind("buffermessage", function(data) {
		document.body.removeChild(temp);
		bufferpm.unbind("buffermessage");
		setTimeout(function () {
		    doneCallback(data);
	    }, 0);
	});
    
};

