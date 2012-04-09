var NO_JQUERY={};(function(a,b,c){if(!("console"in a)){var d=a.console={};d.log=d.warn=d.error=d.debug=function(){}}if(b===NO_JQUERY){b={fn:{},extend:function(){var a=arguments[0];for(var b=1,c=arguments.length;b<c;b++){var d=arguments[b];for(var e in d){a[e]=d[e]}}return a}}}b.fn.pm=function(){console.log("usage: \nto send:    $.pm(options)\nto receive: $.pm.bind(type, fn, [origin])");return this};b.pm=a.bufferpm=function(a){e.send(a)};b.pm.bind=a.bufferpm.bind=function(a,b,c,d){e.bind(a,b,c,d)};b.pm.unbind=a.bufferpm.unbind=function(a,b){e.unbind(a,b)};b.pm.origin=a.bufferpm.origin=null;b.pm.poll=a.bufferpm.poll=200;var e={send:function(a){var c=b.extend({},e.defaults,a),d=c.target;if(!c.target){console.warn("postmessage target window required");return}if(!c.type){console.warn("postmessage type required");return}var f={data:c.data,type:c.type};if(c.success){f.callback=e._callback(c.success)}if(c.error){f.errback=e._callback(c.error)}if("postMessage"in d&&!c.hash){e._bind();d.postMessage(JSON.stringify(f),c.origin||"*")}else{e.hash._bind();e.hash.send(c,f)}},bind:function(c,d,f,g){if("postMessage"in a&&!g){e._bind()}else{e.hash._bind()}var h=e.data("listeners.postmessage");if(!h){h={};e.data("listeners.postmessage",h)}var i=h[c];if(!i){i=[];h[c]=i}i.push({fn:d,origin:f||b.pm.origin})},unbind:function(a,b){var c=e.data("listeners.postmessage");if(c){if(a){if(b){var d=c[a];if(d){var f=[];for(var g=0,h=d.length;g<h;g++){var i=d[g];if(i.fn!==b){f.push(i)}}c[a]=f}}else{delete c[a]}}else{for(var g in c){delete c[g]}}}},data:function(a,b){if(b===c){return e._data[a]}e._data[a]=b;return b},_data:{},_CHARS:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),_random:function(){var a=[];for(var b=0;b<32;b++){a[b]=e._CHARS[0|Math.random()*32]}return a.join("")},_callback:function(a){var b=e.data("callbacks.postmessage");if(!b){b={};e.data("callbacks.postmessage",b)}var c=e._random();b[c]=a;return c},_bind:function(){if(!e.data("listening.postmessage")){if(a.addEventListener){a.addEventListener("message",e._dispatch,false)}else if(a.attachEvent){a.attachEvent("onmessage",e._dispatch)}e.data("listening.postmessage",1)}},_dispatch:function(a){try{var b=JSON.parse(a.data)}catch(c){console.warn("postmessage data invalid json: ",c);return}if(!b.type){console.warn("postmessage message type required");return}var d=e.data("callbacks.postmessage")||{},f=d[b.type];if(f){f(b.data)}else{var g=e.data("listeners.postmessage")||{};var h=g[b.type]||[];for(var i=0,j=h.length;i<j;i++){var k=h[i];if(k.origin&&a.origin!==k.origin){console.warn("postmessage message origin mismatch",a.origin,k.origin);if(b.errback){var l={message:"postmessage origin mismatch",origin:[a.origin,k.origin]};e.send({target:a.source,data:l,type:b.errback})}continue}try{var m=k.fn(b.data);if(b.callback){e.send({target:a.source,data:m,type:b.callback})}}catch(c){if(b.errback){e.send({target:a.source,data:c,type:b.errback})}}}}}};e.hash={send:function(b,c){var d=b.target,f=b.url;if(!f){console.warn("postmessage target window url is required");return}f=e.hash._url(f);var g,h=e.hash._url(a.location.href);if(a==d.parent){g="parent"}else{try{for(var i=0,j=parent.frames.length;i<j;i++){var k=parent.frames[i];if(k==a){g=i;break}}}catch(l){g=a.name}}if(g==null){console.warn("postmessage windows must be direct parent/child windows and the child must be available through the parent window.frames list");return}var m={"x-requested-with":"postmessage",source:{name:g,url:h},postmessage:c};var n="#x-postmessage-id="+e._random();d.location=f+n+encodeURIComponent(JSON.stringify(m))},_regex:/^\#x\-postmessage\-id\=(\w{32})/,_regex_len:"#x-postmessage-id=".length+32,_bind:function(){if(!e.data("polling.postmessage")){setInterval(function(){var b=""+a.location.hash,c=e.hash._regex.exec(b);if(c){var d=c[1];if(e.hash._last!==d){e.hash._last=d;e.hash._dispatch(b.substring(e.hash._regex_len))}}},b.pm.poll||200);e.data("polling.postmessage",1)}},_dispatch:function(b){if(!b){return}try{b=JSON.parse(decodeURIComponent(b));if(!(b["x-requested-with"]==="postmessage"&&b.source&&b.source.name!=null&&b.source.url&&b.postmessage)){return}}catch(c){return}var d=b.postmessage,f=e.data("callbacks.postmessage")||{},g=f[d.type];if(g){g(d.data)}else{var h;if(b.source.name==="parent"){h=a.parent}else{h=a.frames[b.source.name]}var i=e.data("listeners.postmessage")||{};var j=i[d.type]||[];for(var k=0,l=j.length;k<l;k++){var m=j[k];if(m.origin){var n=/https?\:\/\/[^\/]*/.exec(b.source.url)[0];if(n!==m.origin){console.warn("postmessage message origin mismatch",n,m.origin);if(d.errback){var o={message:"postmessage origin mismatch",origin:[n,m.origin]};e.send({target:h,data:o,type:d.errback,hash:true,url:b.source.url})}continue}}try{var p=m.fn(d.data);if(d.callback){e.send({target:h,data:p,type:d.callback,hash:true,url:b.source.url})}}catch(c){if(d.errback){e.send({target:h,data:c,type:d.errback,hash:true,url:b.source.url})}}}}},_url:function(a){return(""+a).replace(/#.*$/,"")}};b.extend(e,{defaults:{target:null,url:null,type:null,data:null,success:null,error:null,origin:"*",hash:false}})})(this,typeof jQuery==="undefined"?NO_JQUERY:jQuery);if(!("JSON"in window&&window.JSON)){JSON={}}(function(){function str(a,b){var c,d,e,f,g=gap,h,i=b[a];if(i&&typeof i==="object"&&typeof i.toJSON==="function"){i=i.toJSON(a)}if(typeof rep==="function"){i=rep.call(b,a,i)}switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i){return"null"}gap+=indent;h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1){h[c]=str(c,i)||"null"}e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]";gap=g;return e}if(rep&&typeof rep==="object"){f=rep.length;for(c=0;c<f;c+=1){d=rep[c];if(typeof d==="string"){e=str(d,i);if(e){h.push(quote(d)+(gap?": ":":")+e)}}}}else{for(d in i){if(Object.hasOwnProperty.call(i,d)){e=str(d,i);if(e){h.push(quote(d)+(gap?": ":":")+e)}}}}e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}";gap=g;return e}}function quote(a){escapable.lastIndex=0;return escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b==="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function f(a){return a<10?"0"+a:a}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(a){return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z"};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;if(typeof JSON.stringify!=="function"){JSON.stringify=function(a,b,c){var d;gap="";indent="";if(typeof c==="number"){for(d=0;d<c;d+=1){indent+=" "}}else{if(typeof c==="string"){indent=c}}rep=b;if(b&&typeof b!=="function"&&(typeof b!=="object"||typeof b.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":a})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e==="object"){for(c in e){if(Object.hasOwnProperty.call(e,c)){d=walk(e,c);if(d!==undefined){e[c]=d}else{delete e[c]}}}}return reviver.call(a,b,e)}var j;cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}})()
var TwitterBuffer = function()
{
	var source = "safari";
	
	function fixLinksInTweet(el, buffer_text)
	{
		var tweet_obj = $(el).parents('div.tweet').find('div.tweet-text');
		var tweet_links = tweet_obj.find('a.twitter-timeline-link');
		for(i=0; i<tweet_links.length; i++) {
			var link_in_text = $(tweet_links[i]).text();
			var link_href = $(tweet_links[i]).attr('href');
			buffer_text = buffer_text.replace(link_in_text, link_href);
		}
		return buffer_text;
	}
	
	function fixLinksInNewTweet(el, buffer_text)
	{
		var tweet_obj = $(el).parents('div.tweet').find('p.js-tweet-text');
		var tweet_links = tweet_obj.find('a.twitter-timeline-link');
		for(i=0; i<tweet_links.length; i++) {
			var link_in_text = $(tweet_links[i]).text();
			var link_href = $(tweet_links[i]).attr('href');
			buffer_text = buffer_text.replace(link_in_text, link_href);
		}
		return buffer_text;
	}
	
	function attachClickListener(buffer_action)
	{
		$(buffer_action).click(function(e){
			e.preventDefault();
			var el = this;
			var twitter_username = $(el).parents('div.tweet').attr('data-screen-name');
			var buffer_url = "";
			var buffer_text = "RT @"+twitter_username+": "+$(el).parents('div.tweet').find('div.tweet-text').text();
			// find links in the tweet and replace the expanded t.co links with their short url
			buffer_text = fixLinksInTweet(el, buffer_text);
			buffer_text = encodeURIComponent(buffer_text);
			var buffer_query_string = "?url="+buffer_url+"&text="+buffer_text+"&source="+source;
			var iframe = $(document.createElement('iframe')).attr('allowtransparency', 'true').attr('src', 'http://bufferapp.com/bookmarklet/'+buffer_query_string).attr('name', 'buffer_iframe').attr('id', 'buffer_iframe').attr('scrolling', 'no');
			$("body").append(iframe);
			bufferpm.bind("buffermessage", function(data) {
				$('#buffer_iframe').remove();
				return false;
			});
		});
	}
	
	function replaceLineBreaks(text)
	{
		var original_text = text;
		var new_text = text.replace('\n', ' ');
		if(original_text == new_text) return new_text;
		else return replaceLineBreaks(new_text);
	}
	
	function attachNewClickListener(buffer_action)
	{
		$(buffer_action).click(function(e){
			e.preventDefault();
			var el = this;
			var twitter_username = $(el).parents('div.tweet').attr('data-screen-name');
			var buffer_url = "";
			var tweet_html = replaceLineBreaks($(el).parents('div.tweet').find('p.js-tweet-text').html());
			tweet_text = $('<span>'+tweet_html+'</span>').text();
			var buffer_text = "RT @"+twitter_username+": "+tweet_text;
			// find links in the tweet and replace the expanded t.co links with their short url
			buffer_text = fixLinksInNewTweet(el, buffer_text);
			buffer_text = encodeURIComponent(buffer_text);
			var buffer_query_string = "?url="+buffer_url+"&text="+buffer_text+"&source="+source;
			var iframe = $(document.createElement('iframe')).attr('allowtransparency', 'true').attr('src', 'http://bufferapp.com/bookmarklet/'+buffer_query_string).attr('name', 'buffer_iframe').attr('id', 'buffer_iframe').attr('scrolling', 'no');
			$("body").append(iframe);
			bufferpm.bind("buffermessage", function(data) {
				$('#buffer_iframe').remove();
				return false;
			});
		});
		
		$(buffer_action).hover(function(e){
			e.preventDefault();
			buffer_action.find('i').css('background-color', buffer_action.find('b').css('color'));
		});
	}
	
	function createBufferAction(tweet_id)
	{
		var buffer_action = $('<a href="#" class="buffer-action old" data-tweet-id="'+tweet_id+'" title="Buffer"><span><i></i><b>Buffer</b></span></a>');
		attachClickListener(buffer_action);
		return buffer_action;
	}
	
	function createNewBufferAction(tweet_id)
	{
		var buffer_action = $('<li><a href="#" class="buffer-action new" data-tweet-id="'+tweet_id+'" title="Buffer"><span><i></i> <b>Buffer</b></span></a></li>');
		attachNewClickListener(buffer_action);
		return buffer_action;
	}
	
	function addBufferToActionElement(action_element)
	{
		var tweet_id = $(action_element).attr('data-tweet-id');
		var buffer_action = createBufferAction(tweet_id);
		$(action_element).append(buffer_action);
	}
	
	function createNewFadeAction()
	{
		return $('<li class="buffer-fade-action"><span>&nbsp;</span></li>');
	}
	
	function addBufferToActionList(action_list)
	{
		var tweet_id = $(action_list).parents('.tweet').attr('data-item-id');
		var buffer_action = createNewBufferAction(tweet_id);
		$(action_list).find('.action-open-container').before(buffer_action);
		var fade_action = createNewFadeAction();
		$(action_list).prepend(fade_action);
		if($(action_list).parents('.tweet').hasClass('permalink-tweet') || $(action_list).parent().hasClass('stream-item-header'))
		{
			buffer_action.find('i').css('background-color', buffer_action.find('b').css('color'));
		}
	}
	
	function addBufferToActionElementToOldTweets(tweets)
	{
		for(i=0; i<tweets.length; i++)
		{
			addBufferToActionElement(tweets[i]);
		}
	}
	
	function addBufferToActionElementToNewTweets(tweets)
	{
		var action_lists = $(tweets);
		for(i=0; i<action_lists.length; i++)
		{
			addBufferToActionList(action_lists[i]);
		}
	}
	
	function getOldTweetsToAdjust()
	{
		return $('span.tweet-actions:not(:has(a.buffer-action))'); 
	}
	
	function getNewTweetsToAdjust()
	{
		return $('div.tweet ul.actions:not(:has(a.buffer-action))');
	}

	function checkForTweets()
	{
	
		var old_tweets = getOldTweetsToAdjust();
		addBufferToActionElementToOldTweets(old_tweets);
		
		var new_tweets = getNewTweetsToAdjust();
		addBufferToActionElementToNewTweets(new_tweets);
		
	}
	
	// let's check for new Tweets every half a second
	setInterval(checkForTweets, 500);

};