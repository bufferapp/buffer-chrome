var Sites = function()
{
	var exports = {};
	var sites = ['Twitter', 'OldTwitter', 'HackerNews'];
	
	exports.debug = true; // be sure to set this to false for production
	exports.source = "chrome";
	
	exports.inject = function()
	{
		for(i=0; i<sites.length; i++) {
			var site = window[sites[i]];
			if(site.inject())
			{
				if(Sites.debug) console.log('Injected into '+sites[i]);
				break;
			}
			else
			{
				if(Sites.debug) console.log('Not injected into '+sites[i]);
			}
		}
	}
	
	return exports;
	
}();

var Twitter = function()
{
	var exports = {};
	
	exports.inject = function()
	{
		if(/twitter.com/.test(window.location.hostname))
		{
			return tryToInject();
		}
		return false;
	}
	
	var tryToInject = function()
	{
		var tweets = getTweetsToAdjust();
		if(tweets.length)
		{
			setInterval(injectBufferToTwitter, 500);
			return true;
		}
		else return false;
	}
	
	var getTweetsToAdjust = function()
	{
		return $('div.tweet ul.actions:not(:has(a.buffer-action))');
	}
	
	var injectBufferToTwitter = function()
	{
		NewTwitter.inject();
		NewTwitterSplitTest.inject();
	}
	
	return exports;
}();

var NewTwitter = function()
{
	var exports = {};
	
	exports.inject = function()
	{
		if(Sites.debug) console.log('Injecting into NewTwitter');
		checkForTweets();
		return true;
	}
	
	var fixLinksInTweet = function(el, buffer_text)
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
	
	var fixLinksInNewTweet = function(el, buffer_text)
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
	
	var replaceLineBreaks = function(text)
	{
		var original_text = text;
		var new_text = text.replace('\n', ' ');
		if(original_text == new_text) return new_text;
		else return replaceLineBreaks(new_text);
	}
	
	var attachNewClickListener = function(buffer_action)
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
			var buffer_query_string = "?url="+buffer_url+"&text="+buffer_text+"&source="+Sites.source;
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
	
	var createNewBufferAction = function(tweet_id)
	{
		var buffer_action = $('<li><a href="#" class="buffer-action new" data-tweet-id="'+tweet_id+'" title="Buffer"><span><i></i> <b>Buffer</b></span></a></li>');
		attachNewClickListener(buffer_action);
		return buffer_action;
	}
	
	var createNewFadeAction = function()
	{
		return $('<li class="buffer-fade-action"><span>&nbsp;</span></li>');
	}
	
	var addBufferToActionList = function(action_list)
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
	
	var addBufferToActionElementToNewTweets = function(tweets)
	{
		var action_lists = $(tweets);
		for(i=0; i<action_lists.length; i++)
		{
			addBufferToActionList(action_lists[i]);
		}
	}
	
	var getNewTweetsToAdjust = function()
	{
		return $('div.tweet div.stream-item-header ul.actions:not(:has(a.buffer-action))');
	}

	var checkForTweets = function()
	{
		var new_tweets = getNewTweetsToAdjust();
		console.log('Found ' + new_tweets.length + ' NewTwitter Tweets to adjust');
		if(new_tweets.length) addBufferToActionElementToNewTweets(new_tweets);
	}

	return exports;
}();

var NewTwitterSplitTest = function()
{
	var exports = {};
	
	exports.inject = function()
	{
		if(Sites.debug) console.log('Injecting into NewTwitterSplitTest');
		checkForTweets();
		return false;
	}
	
	var getNewTweetsToAdjust = function()
	{
		return $('div.tweet div.stream-item-footer ul.actions:not(:has(a.buffer-action))');
	}

	var checkForTweets = function()
	{
		var new_tweets = getNewTweetsToAdjust();
		console.log('Found ' + new_tweets.length + ' NewTwitterSplitTest Tweets to adjust');
		addBufferToActionElementToNewTweets(new_tweets);
	}
	
	var addBufferToActionElementToNewTweets = function(tweets)
	{
		var action_lists = $(tweets);
		for(i=0; i<action_lists.length; i++)
		{
			addBufferToActionList(action_lists[i]);
		}
	}
	
	var addBufferToActionList = function(action_list)
	{
		var tweet_id = $(action_list).parents('.tweet').attr('data-item-id');
		var buffer_action = createNewBufferAction(tweet_id);
		$(action_list).append(buffer_action);
		if($(action_list).parents('.tweet').hasClass('permalink-tweet') || $(action_list).parent().hasClass('stream-item-header'))
		{
			buffer_action.find('i').css('background-color', buffer_action.find('b').css('color'));
		}
	}
	
	var fixLinksInTweet = function(el, buffer_text)
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
	
	var fixLinksInNewTweet = function(el, buffer_text)
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
	
	var replaceLineBreaks = function(text)
	{
		var original_text = text;
		var new_text = text.replace('\n', ' ');
		if(original_text == new_text) return new_text;
		else return replaceLineBreaks(new_text);
	}
	
	var attachNewClickListener = function(buffer_action)
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
			var buffer_query_string = "?url="+buffer_url+"&text="+buffer_text+"&source="+Sites.source;
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
	
	var createNewBufferAction = function(tweet_id)
	{
		var buffer_action = $('<li><a href="#" class="buffer-action new" data-tweet-id="'+tweet_id+'" title="Buffer"><span><i></i> <b>Buffer</b></span></a></li>');
		attachNewClickListener(buffer_action);
		return buffer_action;
	}
	
	return exports;
}();

var OldTwitter = function()
{
	var exports = {};
	
	exports.inject = function()
	{
		if(/twitter.com/.test(window.location.hostname))
		{
			return tryToInject();
		}
		return false;
	}
	
	var tryToInject = function()
	{
		var tweets = getTweetsToAdjust();
		if(tweets.length)
		{
			setInterval(checkForTweets, 500);
			return true;
		}
		else return false;
	}
	
	function checkForTweets()
	{
		var tweets = getTweetsToAdjust();
		addBufferToActionElementToTweets(tweets);
	}
	
	function getTweetsToAdjust()
	{
		return $('span.tweet-actions:not(:has(a.buffer-action))'); 
	}
	
	function addBufferToActionElementToTweets(tweets)
	{
		for(i=0; i<tweets.length; i++)
		{
			addBufferToActionElement(tweets[i]);
		}
	}
	
	function addBufferToActionElement(action_element)
	{
		var tweet_id = $(action_element).attr('data-tweet-id');
		var buffer_action = createBufferAction(tweet_id);
		$(action_element).append(buffer_action);
	}
	
	function createBufferAction(tweet_id)
	{
		var buffer_action = $('<a href="#" class="buffer-action old" data-tweet-id="'+tweet_id+'" title="Buffer"><span><i></i><b>Buffer</b></span></a>');
		attachClickListener(buffer_action);
		return buffer_action;
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
			var buffer_query_string = "?url="+buffer_url+"&text="+buffer_text+"&source="+Sites.source;
			var iframe = $(document.createElement('iframe')).attr('allowtransparency', 'true').attr('src', 'http://bufferapp.com/bookmarklet/'+buffer_query_string).attr('name', 'buffer_iframe').attr('id', 'buffer_iframe').attr('scrolling', 'no');
			$("body").append(iframe);
			bufferpm.bind("buffermessage", function(data) {
				$('#buffer_iframe').remove();
				return false;
			});
		});
	}
	
	var fixLinksInTweet = function(el, buffer_text)
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
	
	function replaceLineBreaks(text)
	{
		var original_text = text;
		var new_text = text.replace('\n', ' ');
		if(original_text == new_text) return new_text;
		else return replaceLineBreaks(new_text);
	}
	
	return exports;
}();

var HackerNews = function()
{
	var exports = {};
	
	exports.inject = function()
	{
		if(/news.ycombinator/.test(window.location.hostname))
		{
			return true;
		}
		return false;
	}
	
	return exports;
}();

Sites.inject();