var TwitterBuffer = function()
{
	var source = "chrome";
	
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

}();