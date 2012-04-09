// postmessage
var NO_JQUERY={};(function(a,b,c){if(!("console"in a)){var d=a.console={};d.log=d.warn=d.error=d.debug=function(){}}if(b===NO_JQUERY){b={fn:{},extend:function(){var a=arguments[0];for(var b=1,c=arguments.length;b<c;b++){var d=arguments[b];for(var e in d){a[e]=d[e]}}return a}}}b.fn.pm=function(){console.log("usage: \nto send:    $.pm(options)\nto receive: $.pm.bind(type, fn, [origin])");return this};b.pm=a.bufferpm=function(a){e.send(a)};b.pm.bind=a.bufferpm.bind=function(a,b,c,d){e.bind(a,b,c,d)};b.pm.unbind=a.bufferpm.unbind=function(a,b){e.unbind(a,b)};b.pm.origin=a.bufferpm.origin=null;b.pm.poll=a.bufferpm.poll=200;var e={send:function(a){var c=b.extend({},e.defaults,a),d=c.target;if(!c.target){console.warn("postmessage target window required");return}if(!c.type){console.warn("postmessage type required");return}var f={data:c.data,type:c.type};if(c.success){f.callback=e._callback(c.success)}if(c.error){f.errback=e._callback(c.error)}if("postMessage"in d&&!c.hash){e._bind();d.postMessage(JSON.stringify(f),c.origin||"*")}else{e.hash._bind();e.hash.send(c,f)}},bind:function(c,d,f,g){if("postMessage"in a&&!g){e._bind()}else{e.hash._bind()}var h=e.data("listeners.postmessage");if(!h){h={};e.data("listeners.postmessage",h)}var i=h[c];if(!i){i=[];h[c]=i}i.push({fn:d,origin:f||b.pm.origin})},unbind:function(a,b){var c=e.data("listeners.postmessage");if(c){if(a){if(b){var d=c[a];if(d){var f=[];for(var g=0,h=d.length;g<h;g++){var i=d[g];if(i.fn!==b){f.push(i)}}c[a]=f}}else{delete c[a]}}else{for(var g in c){delete c[g]}}}},data:function(a,b){if(b===c){return e._data[a]}e._data[a]=b;return b},_data:{},_CHARS:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),_random:function(){var a=[];for(var b=0;b<32;b++){a[b]=e._CHARS[0|Math.random()*32]}return a.join("")},_callback:function(a){var b=e.data("callbacks.postmessage");if(!b){b={};e.data("callbacks.postmessage",b)}var c=e._random();b[c]=a;return c},_bind:function(){if(!e.data("listening.postmessage")){if(a.addEventListener){a.addEventListener("message",e._dispatch,false)}else if(a.attachEvent){a.attachEvent("onmessage",e._dispatch)}e.data("listening.postmessage",1)}},_dispatch:function(a){try{var b=JSON.parse(a.data)}catch(c){console.warn("postmessage data invalid json: ",c);return}if(!b.type){console.warn("postmessage message type required");return}var d=e.data("callbacks.postmessage")||{},f=d[b.type];if(f){f(b.data)}else{var g=e.data("listeners.postmessage")||{};var h=g[b.type]||[];for(var i=0,j=h.length;i<j;i++){var k=h[i];if(k.origin&&a.origin!==k.origin){console.warn("postmessage message origin mismatch",a.origin,k.origin);if(b.errback){var l={message:"postmessage origin mismatch",origin:[a.origin,k.origin]};e.send({target:a.source,data:l,type:b.errback})}continue}try{var m=k.fn(b.data);if(b.callback){e.send({target:a.source,data:m,type:b.callback})}}catch(c){if(b.errback){e.send({target:a.source,data:c,type:b.errback})}}}}}};e.hash={send:function(b,c){var d=b.target,f=b.url;if(!f){console.warn("postmessage target window url is required");return}f=e.hash._url(f);var g,h=e.hash._url(a.location.href);if(a==d.parent){g="parent"}else{try{for(var i=0,j=parent.frames.length;i<j;i++){var k=parent.frames[i];if(k==a){g=i;break}}}catch(l){g=a.name}}if(g==null){console.warn("postmessage windows must be direct parent/child windows and the child must be available through the parent window.frames list");return}var m={"x-requested-with":"postmessage",source:{name:g,url:h},postmessage:c};var n="#x-postmessage-id="+e._random();d.location=f+n+encodeURIComponent(JSON.stringify(m))},_regex:/^\#x\-postmessage\-id\=(\w{32})/,_regex_len:"#x-postmessage-id=".length+32,_bind:function(){if(!e.data("polling.postmessage")){setInterval(function(){var b=""+a.location.hash,c=e.hash._regex.exec(b);if(c){var d=c[1];if(e.hash._last!==d){e.hash._last=d;e.hash._dispatch(b.substring(e.hash._regex_len))}}},b.pm.poll||200);e.data("polling.postmessage",1)}},_dispatch:function(b){if(!b){return}try{b=JSON.parse(decodeURIComponent(b));if(!(b["x-requested-with"]==="postmessage"&&b.source&&b.source.name!=null&&b.source.url&&b.postmessage)){return}}catch(c){return}var d=b.postmessage,f=e.data("callbacks.postmessage")||{},g=f[d.type];if(g){g(d.data)}else{var h;if(b.source.name==="parent"){h=a.parent}else{h=a.frames[b.source.name]}var i=e.data("listeners.postmessage")||{};var j=i[d.type]||[];for(var k=0,l=j.length;k<l;k++){var m=j[k];if(m.origin){var n=/https?\:\/\/[^\/]*/.exec(b.source.url)[0];if(n!==m.origin){console.warn("postmessage message origin mismatch",n,m.origin);if(d.errback){var o={message:"postmessage origin mismatch",origin:[n,m.origin]};e.send({target:h,data:o,type:d.errback,hash:true,url:b.source.url})}continue}}try{var p=m.fn(d.data);if(d.callback){e.send({target:h,data:p,type:d.callback,hash:true,url:b.source.url})}}catch(c){if(d.errback){e.send({target:h,data:c,type:d.errback,hash:true,url:b.source.url})}}}}},_url:function(a){return(""+a).replace(/#.*$/,"")}};b.extend(e,{defaults:{target:null,url:null,type:null,data:null,success:null,error:null,origin:"*",hash:false}})})(this,typeof jQuery==="undefined"?NO_JQUERY:jQuery)
// json
if (! ("JSON" in window && window.JSON)){JSON={}}(function(){function f(n){return n<10?"0"+n:n}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z"};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)}if(typeof rep==="function"){value=rep.call(holder,key,value)}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null"}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==="string"){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" "}}else{if(typeof space==="string"){indent=space}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":value})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}}());

var BufferBookmarklet = function()
{
	var source = 'chrome';
	
	function getSelectedText()
	{
		var txt = '';
		if (window.getSelection)
			txt = window.getSelection();
		else if (document.getSelection)
			txt = document.getSelection();
		else if (document.selection)
			txt = document.selection.createRange().text;
		else return;
		return txt;
	}
	
	function getGoogleReaderAnchorElement()
	{
		try
		{
			var anchor = document.getElementById('current-entry')
								.getElementsByClassName('entry-container')[0]
								.getElementsByClassName('entry-title')[0]
								.getElementsByTagName('a')[0];
		} catch(err) {
			return false;
		}
		return anchor;
	}
	
	function getGoogleReaderTitle()
	{
		var anchor = getGoogleReaderAnchorElement();
		if(anchor)
		{
			try {
				return anchor.innerText;
			} catch(err) {
				return anchor.textContentl
			}
		}
		return '';
	}
	
	function getGoogleReaderUrl()
	{
		var anchor = getGoogleReaderAnchorElement();
		if(anchor)
		{
			return anchor.getAttribute('href');
		}
		return '';
	}
	
	function getText()
	{
		var text = getSelectedText();
		if(text.toString().length == 0)
		{
			text = getGoogleReaderTitle();
			if(text.toString().length == 0) text = document.title;
		}
		return encodeURIComponent(text);
	}
	
	function getUrl()
	{
		var url = getGoogleReaderUrl();
		if(url.toString().length == 0)
		{
			url = window.location;
		}
		return encodeURIComponent(url);
	}
	
	function getSource()
	{
		if(getGoogleReaderAnchorElement()) return 'google_reader';
		else return source;
	}

	function createIframe()
	{
		var iframe = document.createElement('iframe');
		iframe.allowtransparecny = 'true';
		iframe.scrolling = 'no';
		iframe.id = 'buffer_iframe';
		iframe.name = 'buffer_iframe';
		iframe.style.cssText = "border: none;height: 100%;width: 100%;position: fixed;z-index: 99999999999;top: 0;left: 0;";
		iframe.src = 'http://bufferapp.com/bookmarklet/?url='+getUrl()+'&text='+getText()+'&source='+getSource();
		return iframe;
	}
	
	function bindCloseListener()
	{
		bufferpm.bind("buffermessage", function(data){
			(elem=document.getElementById('buffer_iframe')).parentNode.removeChild(elem);
			return false;
		});
	}
	
	// Here we go!
	var body = document.getElementsByTagName('body')[0];
	var iframe = createIframe();
	body.appendChild(iframe);
	bindCloseListener();

};