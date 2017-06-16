;(function() {

  // Only run this script on tweetdeck:
  if ( window.location.host.indexOf('tweetdeck.twitter.com') !== 0 ) return;

  var conifg = [

    // Streams
    {
      placement: 'tweekdeck-stream',
      selector: '.js-stream-item .js-tweet-actions:not(.buffer-inserted)',
      $button: $([
        '<li class="tweet-action-item pull-left margin-r--13">',
          '<a class="js-buffer-action tweet-action position-rel" href="#" rel="buffer">',
            '<i class="icon icon-buffer txt-right"></i>',
            '<span class="is-vishidden">Buffer</span> ',
          '</a>',
        '</li>'
      ].join('')),
      insert: function(el) {
        var $actions = $(el);
        var $newActionItem = this.$button.clone();

        $actions
          .addClass('buffer-inserted')
          .prepend($newActionItem);

        return $newActionItem;
      },
      getData: function(el) {
        var $streamItem = $(el).closest('.js-stream-item');

        var $text = $streamItem.find('.js-tweet-text');
        var $screenname = $streamItem.find('.username').first();
        var screenname = $screenname.text().trim().replace(/^@/, '');
        var text = getFullTweetText($text, screenname);
        var displayName = $streamItem.find('.fullname').first().text().trim();
        var tweetKey = $streamItem.attr('data-key');
        var $tweetAction;
        var retweeted_tweet_id;

        // Retweet, mention, favorite: non-regular tweet whose data-key attr
        // is formatted differently, and for which we need to get the tweet_id
        // from somewhere else
        if (/^(?:quoted_tweet|favorite|mention)/.test(tweetKey)) {
          $tweetAction = $streamItem.find('.tweet-action[data-user-id]');
          retweeted_tweet_id = $tweetAction.attr('data-chirp-id');
        // Regular tweet
        } else {
          retweeted_tweet_id = tweetKey;
        }

        return {
          text: text,
          placement: this.placement,
          retweeted_tweet_id: retweeted_tweet_id,
          retweeted_user_name: screenname,
          retweeted_user_display_name: displayName
        };
      }
    },

    // Tweet Detail
    {
      placement: 'tweetdeck-detail',
      selector: '.js-tweet-detail .tweet-detail-actions:not(.buffer-inserted)',
      $button: $([
        '<li class="tweet-detail-action-item">',
          '<a class="js-buffer-action tweet-action position-rel" href="#" rel="buffer">',
            '<i class="icon icon-buffer txt-right"></i>',
            '<span class="is-vishidden">Buffer</span> ',
          '</a>',
        '</li>'
      ].join('')),
      insert: function(el) {
        var $actions = $(el);
        var $newActionItem = this.$button.clone();

        $actions
          .addClass('buffer-inserted')
          .prepend($newActionItem);

        return $newActionItem;
      },
      getData: function(el) {
        var $streamItem = $(el).closest('.js-stream-item');

        var $text = $streamItem.find('.js-tweet-text');
        var $screenname = $streamItem.find('.username').first();
        var screenname = $screenname.text().trim().replace(/^@/, '');
        var text = getFullTweetText($text, screenname);
        var displayName = $streamItem.find('.fullname').first().text().trim();

        return {
          text: text,
          placement: this.placement,
          retweeted_tweet_id: $streamItem.attr('data-key'),
          retweeted_user_name: screenname,
          retweeted_user_display_name: displayName
        };
      }
    },

    // Composer slide-out
    {
      placement: 'tweetdeck-composer',
      selector: '.js-docked-compose .js-send-button-container:not(.buffer-inserted)',
      $button: $([
        '<button class="js-buffer-button btn-buffer is-disabled btn btn-extra-height">',
          'Buffer',
        '</button>'
      ].join('')),
      insert: function(el) {
        var $actions = $(el);
        var $newActionItem = this.$button.clone();

        $actions
          .addClass('buffer-inserted')
          .prepend($newActionItem);

        var $container = $(el).closest('.js-docked-compose');
        this.$newActionItem = $newActionItem;
        this.$textarea = $container.find('.js-compose-text');
        this.$charCount = $container.find('.js-character-count');

        // Listen to changes in the textarea
        this.$textarea.on('keyup focus blur change paste cut', this.onKeyup.bind(this));

        return $newActionItem;
      },
      onKeyup: function(e) {
        // NOTE - We check the live character count b/c the URL will be shortened
        var count = parseInt(this.$charCount.val(), 10);
        if (count < 140 && count >= 0) {
          this.$newActionItem.removeClass('is-disabled');
        } else {
          this.$newActionItem.addClass('is-disabled');
        }
      },
      getData: function(el) {
        var $container = $(el).closest('.js-docked-compose');
        var $quotedTweet = $container.find('.quoted-tweet');
        var isRTwcomment = !!$quotedTweet.length;
        var composerText = this.$textarea.val().trim();
        var $text;
        var username;

        if (isRTwcomment) {
          $text = $quotedTweet.find('.js-quoted-tweet-text');
          username = $quotedTweet.find('.username').text().trim().replace(/^@/, '');

          return {
            text: getFullTweetText($text, username),
            placement: this.placement,
            retweeted_tweet_id: $quotedTweet.attr('data-tweet-id'),
            retweeted_user_name: username,
            retweeted_user_display_name: $quotedTweet.find('.fullname').text().trim(),
            retweet_comment: composerText
          };
        } else {
          return {
            text: composerText,
            placement: this.placement
          };
        }
      }
    }

  ];

  // RT modal - This does not work on the loop
  var RTConfig = {
    placement: 'tweetdeck-rt-modal',
    selector: '#actions-modal .js-retweet-button:not(.buffer-inserted)',
    $button: $([
      '<button data-action="buffer" class="js-buffer-button btn btn-buffer">',
        'Buffer Retweet',
      '</button>'
    ].join('')),
    insert: function(el) {
      var $rtButton = $(el);
      var $newActionItem = this.$button.clone();

      $rtButton
        .addClass('buffer-inserted')
        .before($newActionItem)
        .before(' ');

      return $newActionItem;
    },
    getData: function(el) {
      var $tweet = $('#actions-modal .js-tweet');

      var $text = $tweet.find('.js-tweet-text');
      var $screenname = $tweet.find('.username');
      var screenname = $screenname.text().trim().replace(/^@/, '');
      var text = getFullTweetText($text, screenname);
      var displayName = $tweet.find('.fullname').text().trim();
      var tweetURL = $tweet.find('.js-timestamp a').attr('href');

      // NOTE - this is kind of a strict regex, may need to change if URLs change
      var tweetId = tweetURL.replace(/https:\/\/twitter.com\/\w+\/status\//, '');

      return {
        text: text,
        placement: this.placement,
        retweeted_tweet_id: tweetId,
        retweeted_user_name: screenname,
        retweeted_user_display_name: displayName
      };
    }
  };

  var getFullTweetText = function($text, screenname) {
    var $clone = $text.clone();

    // Replace any shortened URL with the full url
    $clone.find('a[data-full-url]').each(function(i, el) {
      el.textContent = el.getAttribute('data-full-url');
    });

    // Replace emotes with their unicode representation
    $clone.find('img.emoji').each(function(i, el) {
      $(el).replaceWith(el.getAttribute('alt'));
    });

    var text = $clone.text().trim();

    // Append link to the tweet's image if there's an image displayed below
    var $imageBelow = $text.siblings('.js-media, .js-tweet-media').first();
    if ($imageBelow.length > 0) {
      var $link = $imageBelow.find('.js-media-image-link').first();
      if ($link.length > 0) text += ' ' + $link.attr('href');
    }

    return 'RT @' + screenname + ': ' + text + '';
  };

  var insertButton = function(target) {
    $(target.selector).each(function(i, el) {
      var $button = target.insert(el);
      $button.on('click', function(e) {
        e.preventDefault();
        xt.port.emit('buffer_click', target.getData(el));
      })
    });
  };

  var insertButtons = function() {
    conifg.forEach(insertButton);
  };

  var tweetdeckLoop = function() {
    insertButtons();
    setTimeout(tweetdeckLoop, 500);
  };

  var currentStyleIndicator = document.head.querySelector('meta[http-equiv="Default-Style"]');

  var checkDarkTheme = function() {
    var isDarkThemeSelected = currentStyleIndicator.getAttribute('content') == 'dark';
    document.body.classList.toggle('buffer-tweetdeck-dark', isDarkThemeSelected);
  };

  var start = function() {

    // Add class for css scoping
    document.body.classList.add('buffer-tweetdeck');

    $(document).ready(function() {
      checkDarkTheme();

      // Observe future changes to the 'disabled' attribute of link[title=dark]
      // Useful if the app hasn't initialized, or if settings are changed later on
      if (window.MutationObserver) {
        var observer = new MutationObserver(checkDarkTheme);
        observer.observe(currentStyleIndicator, { attributes: true, attributeFilter: ['content'] });

        // Stop observing when add-on is disabled/removed (the detach event is Firefox-specific)
        xt.port.on('detach', function() {
          observer.disconnect();
        });
      }
    });

    // Start the loop that will watch for new DOM elements
    tweetdeckLoop();

    // Listen for a RT click so we can inject into the modal instantly
    // This addresses the potentially 500ms delay
    $('body').on('click',
      '.js-stream-item .js-tweet-actions .tweet-action[rel="retweet"],' +
      '.js-tweet-detail .tweet-detail-actions .tweet-detail-action[rel="retweet"]',
      function() {
        // 10ms delay for modal to open
        setTimeout(function() {
          insertButton(RTConfig);
        }, 10);
      });
  }


  // Wait for xt.options to be set
  ;(function check() {
    // If tweetdeck is switched on, start the main loop
    if (!xt.options) {
      setTimeout(check, 0);
    } else if (xt.options['buffer.op.tweetdeck'] === 'tweetdeck') {
      start();
    } else {
      setTimeout(check, 2000);
    }
  }());

}());
