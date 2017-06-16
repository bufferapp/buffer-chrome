;(function() {

  // Only run this script on twitter:
  if ( window.location.host.indexOf('twitter.com') !== 0 ) return;

  var buildElement = function buildElement (parentConfig) {

    var temp = document.createElement(parentConfig[0]);
    if( parentConfig[1] ) temp.setAttribute('class', parentConfig[1]);
    if( parentConfig[2] ) temp.setAttribute('style', parentConfig[2]);

    if ( parentConfig.length > 3 ) {
      var i = 3, l = parentConfig.length;
      for(; i < l; i++) {
        temp.appendChild(buildElement(parentConfig[i]));
      }
    }

    return temp;

  };

  var config = {};
  config.time = {
    success: {
      delay: 2000
    }
  };

  var getTextFromRichtext = function(html) {
    var text;

    // Browsers have different ways of handling contenteditable divs, and the
    // underlying markup is different as a result. Blink/Webkit use divs, Firefox
    // uses brs. ps are here for legacy reasons and can be removed in a few months.
    html = html
      .replace(/<div><br><\/div>/gi, '\n')
      .replace(/<\/div>(\s?)<div>/gi, '\n$1')
      .replace(/<\/p>/gi, '\n')
      .replace(/<br>(?!$)/gi, '\n')
      .replace(/<br>(?=$)/gi, '');

    text = $('<div>')
      .html(html)
      .find('[data-pictograph-text]')
        .replaceWith(function() {
          return $(this).attr('data-pictograph-text');
        })
        .end()
      .text();

    return text;
  };

  config.buttons = [
    {
      // The standalone tweet page after a "Tweet" button has been clicked
      name: "twitter-button",
      text: "Buffer",
      container: 'div.ft',
      after: 'input[type="submit"]',
      default: [
        'margin-left: 8px;',
        'background: #eee;',
        'background: -webkit-linear-gradient(bottom, #eee 25%, #f8f8f8 63%);',
        'background: -moz-linear-gradient(bottom, #eee 25%, #f8f8f8 63%);',
        'border: 1px solid #999;',
        'color: #444 !important;',
        'text-shadow: rgba(0, 0, 0, 0.246094) 0px -1px 0px;'
      ].join(''),
      className: 'button',
      selector: '.button',
      style: [
        'margin-left: 8px;',
        'background: #4C9E46;',
        'background: -webkit-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%);',
        'background: -moz-linear-gradient(bottom, #4C9E46 25%, #54B14E 63%);',
        'border: 1px solid #40873B;',
        'color: white !important;',
        'text-shadow: rgba(0, 0, 0, 0.246094) 0px -1px 0px;'
      ].join(''),
      hover: [
        'background: #40873B;',
        'background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
        'background: -moz-linear-gradient(bottom, #40873B 25%, #4FA749 63%);'
      ].join(''),
      active: [
        'box-shadow: inset 0 5px 10px -6px rgba(0,0,0,.5);',
        'background: #40873B;',
        'background: -webkit-linear-gradient(bottom, #40873B 25%, #4FA749 63%);',
        'background: -moz-linear-gradient(bottom, #40873B 25%, #4FA749 63%);'
      ].join(''),
      create: function (btnConfig) {
        window.resizeTo(845,700);
        window.moveTo(screen.availWidth/2-845/2, screen.availHeight/2+700/2);

        var a = document.createElement('a');
        a.setAttribute('class', btnConfig.className);
        a.setAttribute('style', btnConfig.default);
        a.setAttribute('href', '#');
        $(a).text(btnConfig.text);

        $(a).hover(function () {
          if( $(this).hasClass("disabled") ) {
            $(this).attr('style', btnConfig.default);
            return;
          }
          $(this).attr('style', btnConfig.style + btnConfig.hover);
        }, function() {
          if( $(this).hasClass("disabled") ) return;
          $(this).attr('style', btnConfig.style);
        });

        $(a).mousedown(function () {
          if( $(this).hasClass("disabled") ) return;
          $(this).attr('style', btnConfig.style + btnConfig.active);
        });

        $(a).mouseup(function () {
          if( $(this).hasClass("disabled") ) return;
          $(this).attr('style', btnConfig.style + btnConfig.hover);
        });

        return a;

      },
      data: function (elem) {
        return {
          text: $(elem).parents('.ft').siblings('.bd').find('#status').val(),
          placement: 'twitter-tweetbutton'
        };
      },
      clear: function (elem) {
        window.close();
      },
      activator: function (elem, btnConfig) {
        var target = $(elem).parents('.ft').siblings('.bd').find('#status');
        var activate = function () {
          var val = $(target).val();
          var counter = $(elem).siblings('#char-count').val();
          if ( val && val.length > 0 && counter > -1) {
            $(elem).removeClass('disabled').attr('style', btnConfig.style);
          } else {
            $(elem).addClass('disabled').attr('style', btnConfig.default);
          }
        };
        $(target).on('keyup focus blur change paste cut', function (e) {
          activate();
        });
        activate();
      }
    },
    {
      // The main composer in the twitter "home" page
      name: "composer",
      text: "Buffer",
      container: [ // Two containers:
        'div.tweet-button-sub-container',
        '.tweet-form:not(.dm-tweetbox):not(.RetweetDialog-tweetForm) .tweet-button'
      ].join(','),
      after: '.tweet-counter',
      className: 'buffer-tweet-button btn disabled',
      selector: '.buffer-tweet-button',
      create: function (btnConfig) {

        var a = document.createElement('a');
        var $a = $(a);
        a.setAttribute('class', btnConfig.className);
        a.setAttribute('href', '#');
        $a.text(btnConfig.text);

        return a;
      },
      ignore: function(container) {
        return $(container).closest('.dm-dialog').length ? true : false;
      },
      data: function (elem) {
        var html, text;
        html = $(elem)
          .parents('form')
          .find('.tweet-content .tweet-box')
          .html();

        text = getTextFromRichtext(html);

        return {
          text: text,
          placement: 'twitter-composer'
        };
      },
      clear: function (elem) {
        // Homebox
        var $content = $(elem)
            .parents('form')
            .find('.tweet-content');
        var $target = $content.find('.tweet-box');

        if($(elem).parents('.home-tweet-box').length > 0){
          // If its the home box condense the box after buffer
          $content
            .parents('form')
            .addClass('condensed');
        }

        $target.text('');

        // Modal Close
        // Closes the modal box
        $('#global-tweet-dialog .js-close').click();
      },
      activator: function (elem, btnConfig) {
        var $elem = $(elem);
        var $target = $elem
            .parents('form')
            .find('.tweet-content .tweet-box');

        $target.on('keyup focus blur change paste cut', function (e) {
          var val = $(this).text();
          var counter = $elem.siblings('.tweet-counter').text() ||
            $elem.siblings('.tweet-counter').val();

          if ( val.length > 0 && counter > -1 && val !== 'Compose new Tweet...') {
            $elem.removeClass('disabled');
          } else {
            $elem.addClass('disabled');
          }
        });
      }
    },
    {
      // The Tweet permalink page - OLD
      name: "buffer-permalink-action",
      text: "Buffer",
      container: '.permalink-tweet div.stream-item-footer .tweet-actions',
      after: '.action-fav-container',
      default: '',
      className: 'buffer-action',
      selector: '.buffer-action',
      create: function (btnConfig) {

        var li = document.createElement('li');
        li.className = "action-buffer-container";

        var a = document.createElement('a');
        a.setAttribute('class', btnConfig.className + " with-icn");
        a.setAttribute('href', '#');

        var i = document.createElement('i');
        i.setAttribute('class', 'icon icon-buffer');

        $(a).append(i);

        var b = document.createElement('b');
        $(b).text(btnConfig.text);

        $(a).append(b);

        $(li).append(a);

        return li;


      },
      data: function (elem) {
        var $tweet = $(elem).closest('.tweet');
        // Grab the tweet text
        var $text = $tweet.find('.js-tweet-text').first();
        var username = $tweet.find('.username').first().text().trim();
        // Build the RT text
        var rt = getFullTweetText($text, username);

        // Send back the data
        return {
          text: rt,
          placement: 'twitter-permalink',
          retweeted_tweet_id: $tweet.attr('data-item-id'),
          retweeted_user_id: $tweet.data('user-id'),
          retweeted_user_name: $tweet.data('screen-name'),
          retweeted_user_display_name: $tweet.data('name')
        };
      },
      clear: function (elem) {
      },
      activator: function (elem, btnConfig) {

        if( $(elem).closest('.in-reply-to').length > 0 ) {
          $(elem).find('i').css({'background-position-y': '-30px'});
        }

      }
    },
    {
      // October 2014 permalink page update
      //REVIEW - Refactor to share code with the new OCT 2014 stream item below
      name: "buffer-permalink-action-OCT-2014",
      text: "Add to Buffer",
      // NOTE - Possibly switch from permalink one day
      // NOTE - to avoid injection into AUG 2015 stream (see below)
      container: '.permalink .js-actionable-tweet .js-actions:not(.ProfileTweet-actionList--withCircle, .ProfileTweet-actionList)',
      after: '.js-toggleRt',
      default: '',
      className: 'ProfileTweet-action js-tooltip',
      selector: '.buffer-action',
      create: function (btnConfig) {

        var div = document.createElement('div');
        div.className = "action-buffer-container";
        // Normal is 10px, this adds space for display: inline-block hidden space
        // div.style.marginLeft = '12px';

        var a = document.createElement('a');
        a.setAttribute('class', btnConfig.className);
        a.setAttribute('href', '#');
        a.setAttribute('data-original-title', btnConfig.text); // Tooltip text

        var i = document.createElement('span');
        i.setAttribute('class', 'icon icon-buffer');

        $(a).append(i);

        $(div).append(a);

        return div;
      },
      data: function (elem) {
        var $tweet = $(elem).closest('.js-actionable-tweet');
        var $text = $tweet.find('.js-tweet-text').first();

        // Build the RT text
        var screenname = $tweet.attr('data-screen-name');
        if (!screenname) {
          screenname = $tweet.find('.js-action-profile-name')
            .filter(function(i){ return $(this).text()[0] === '@' })
            .first()
            .text()
            .trim()
            .replace(/^@/, '');
        }
        var text = getFullTweetText($text, screenname);

        // Send back the data
        return {
          text: text,
          placement: 'twitter-permalink',
          retweeted_tweet_id:          $tweet.attr('data-item-id'),
          retweeted_user_id:           $tweet.attr('data-user-id'),
          retweeted_user_name:         $tweet.attr('data-screen-name'),
          retweeted_user_display_name: $tweet.attr('data-name')
        };
      },
      clear: function (elem) {
      },
      activator: function (elem, btnConfig) {
        var $btn = $(elem);

        // Remove extra margin on the last item in the list to prevent overflow
        var moreActions = $btn.siblings('.js-more-tweet-actions').get(0);
        if (moreActions) {
          moreActions.style.marginRight = '0px';
        }

        if( $btn.closest('.in-reply-to').length > 0 ) {
          $btn.find('i').css({'background-position-y': '-21px'});
        }
      }
    },
    {
      // October 2014 profile & home stream changes
      name: "buffer-profile-stream-OCT-2014",
      text: "Add to Buffer",
      // NOTE - to avoid injection into AUG 2015 stream (see below)
      container: '.js-stream-item .js-actions:not(.ProfileTweet-actionList--withCircle, .ProfileTweet-actionList)',
      after: '.js-toggleRt, .js-toggle-rt',
      //NOTE: .js-toggleRt is new OCT 2014
      default: '',
      className: 'ProfileTweet-action js-tooltip',
      selector: '.buffer-action',
      create: function (btnConfig) {

        var div = document.createElement('div');
        div.className = "action-buffer-container";

        var a = document.createElement('a');
        a.setAttribute('class', btnConfig.className);
        a.setAttribute('href', '#');
        a.setAttribute('data-original-title', btnConfig.text); // Tooltip text

        var i = document.createElement('span');
        i.setAttribute('class', 'icon icon-buffer');

        $(a).append(i);

        $(div).append(a);

        return div;
      },
      data: function (elem) {

        // NOTE: .js-stream-tweet - new in OCT 2014
        var $tweet = $(elem).closest('.js-tweet, .js-stream-tweet');
        var $text = $tweet.find('.js-tweet-text').first();

        // Build the RT text
        var screenname = $tweet.attr('data-screen-name');
        if (!screenname) {
          screenname = $tweet.find('.js-action-profile-name')
            .filter(function(i){ return $(this).text()[0] === '@' })
            .first()
            .text()
            .trim()
            .replace(/^@/, '');
        }
        var text = getFullTweetText($text, screenname);

        // Send back the data
        return {
          text: text,
          placement: 'twitter-feed',
          retweeted_tweet_id:          $tweet.attr('data-item-id'),
          retweeted_user_id:           $tweet.attr('data-user-id'),
          retweeted_user_name:         $tweet.attr('data-screen-name'),
          retweeted_user_display_name: $tweet.attr('data-name')
        };
      },
      clear: function (elem) {
      },
      activator: function (elem, btnConfig) {
        var $btn = $(elem);

        // Remove extra margin on the last item in the list to prevent overflow
        var moreActions = $btn.siblings('.js-more-tweet-actions').get(0);
        if (moreActions) {
          moreActions.style.marginRight = '0px';
        }

        if( $btn.closest('.in-reply-to').length > 0 ) {
          $btn.find('i').css({'background-position-y': '-21px'});
        }
      }
    },
    {
      // August 2015 stream changes (circles)
      // Sept 2015 changes extended that button-based markup to all versions of twitter.com,
      // making "--withCircle" a variant of that
      name: "buffer-profile-stream-AUG-2015",
      text: "Add to Buffer",
      container:
        '.js-stream-tweet .js-actions.ProfileTweet-actionList,' +
        '.permalink .js-actionable-tweet .js-actions.ProfileTweet-actionList,' +
        '.js-stream-tweet .js-actions.ProfileTweet-actionList--withCircle,' +
        '.permalink .js-actionable-tweet .js-actions.ProfileTweet-actionList--withCircle'
      ,
      after: '.js-toggleRt, .js-toggle-rt',
      default: '',
      selector: '.buffer-action',
      create: function (btnConfig) {

        /* Desired DOM structure:
          <div class="ProfileTweet-action ProfileTweet-action--buffer js-toggleState">
            <button class="ProfileTweet-actionButton js-actionButton" type="button">
              <div class="IconContainer js-tooltip" data-original-title="Add to Buffer">
                <span class="Icon Icon--circleFill"></span> <!-- enabled via CSS for circle variant -->
                <span class="Icon Icon--circle"></span> <!-- enabled via CSS for circle variant -->
                <span class="Icon Icon--buffer"></span>
                <span class="u-hiddenVisually">Buffer</span>
              </div>
            </button>
          <div>
        */

        var action = document.createElement('div');
        action.className = 'ProfileTweet-action ProfileTweet-action--buffer js-toggleState';
        var button = document.createElement('button');
        button.className = 'ProfileTweet-actionButton js-actionButton';
        button.type = 'button';
        var iconCntr = document.createElement('div');
        iconCntr.className = 'IconContainer js-tooltip';
        iconCntr.setAttribute('data-original-title', btnConfig.text); // tooltip text
        var icon = document.createElement('span');
        icon.className = 'Icon Icon--buffer';
        var circle = document.createElement('span');
        circle.className = 'Icon Icon--circle';
        var circleFill = document.createElement('span');
        circleFill.className = 'Icon Icon--circleFill';
        var text = document.createElement('span');
        text.className = 'u-hiddenVisually';
        text.textContent = 'Buffer';

        iconCntr.appendChild(circleFill);
        iconCntr.appendChild(circle);
        iconCntr.appendChild(icon);
        iconCntr.appendChild(text);
        button.appendChild(iconCntr);
        action.appendChild(button);

        return action;
      },
      data: function (elem) {

        // NOTE: .js-stream-tweet - new in OCT 2014
        var $tweet = $(elem).closest('.js-tweet, .js-stream-tweet, .js-actionable-tweet');
        var $text = $tweet.find('.js-tweet-text').first();

        // Build the RT text
        var screenname = $tweet.attr('data-screen-name');
        if (!screenname) {
          screenname = $tweet.find('.js-action-profile-name')
            .filter(function(i){ return $(this).text()[0] === '@' })
            .first()
            .text()
            .trim()
            .replace(/^@/, '');
        }
        var text = getFullTweetText($text, screenname);

        // Send back the data
        return {
          text: text,
          placement: 'twitter-feed',
          retweeted_tweet_id:          $tweet.attr('data-item-id'),
          retweeted_user_id:           $tweet.attr('data-user-id'),
          retweeted_user_name:         $tweet.attr('data-screen-name'),
          retweeted_user_display_name: $tweet.attr('data-name')
        };
      },
      clear: function (elem) {
      },
      activator: function (elem, btnConfig) {
        var $btn = $(elem);

        // Remove extra margin on the last item in the list to prevent overflow
        var moreActions = $btn.siblings('.js-more-tweet-actions').get(0);
        if (moreActions) {
          moreActions.style.marginRight = '0px';
        }

        if( $btn.closest('.in-reply-to').length > 0 ) {
          $btn.find('i').css({'background-position-y': '-21px'});
        }
      }
    },
    {
      // Retweet modal window
      name: "retweet",
      text: "Buffer Retweet",
      container: '.tweet-form.RetweetDialog-tweetForm .tweet-button',
      after: '.tweet-counter',
      className: 'buffer-tweet-button btn',
      selector: '.buffer-tweet-button',
      create: function (btnConfig) {

        var a = document.createElement('a');
        a.setAttribute('class', btnConfig.className);
        a.setAttribute('href', '#');
        $(a).text(btnConfig.text);

        return a;

      },
      data: function (elem) {
        var $elem = $(elem);
        var $dialog = $elem.closest('.retweet-tweet-dialog, #retweet-dialog, #retweet-tweet-dialog');
        var $tweet = $dialog.find('.js-actionable-tweet').first();

        var screenname = $tweet.attr('data-screen-name');
        if (!screenname) {
          screenname = $tweet.find('.js-action-profile-name')
            .filter(function(i){ return $(this).text()[0] === '@' })
            .first()
            .text()
            .trim()
            .replace(/^@/, '');
        }
        var $text = $tweet.find('.js-tweet-text').first();
        var text = getFullTweetText($text, screenname);

        var commentHtml = $elem.closest('form.is-withComment').find('.tweet-content .tweet-box').html();
        var comment = commentHtml? getTextFromRichtext(commentHtml) : '';

        return {
          text:                        text,
          placement:                   'twitter-retweet',
          retweeted_tweet_id:          $tweet.attr('data-item-id'),
          retweeted_user_id:           $tweet.attr('data-user-id'),
          retweeted_user_name:         $tweet.attr('data-screen-name'),
          retweeted_user_display_name: $tweet.attr('data-name'),
          retweet_comment:             comment
        };
      },
      activator: function (elem, btnConfig) {
        var $elem = $(elem);
        var $target = $elem.closest('form').find('.tweet-content .tweet-box');

        $target.on('keyup focus blur change paste cut', function(e) {
          var counter = $elem.siblings('.tweet-counter').text() ||
            $elem.siblings('.tweet-counter').val();

          if (counter > -1) {
            $elem.removeClass('disabled');
          } else {
            $elem.addClass('disabled');
          }
        });
      }
    }

  ];

  // Parse a tweet a return text representing it
  // NOTE: some more refactoring can be done here, e.g. taking care of
  // expanding short links in a single place
  var getFullTweetText = function($text, screenName) {
    var $clone = $text.clone();

    // Expand URLs
    $clone.find('a[data-expanded-url]').each(function() {
      this.textContent = this.getAttribute('data-expanded-url');
    });

    // Replace emotes with their unicode representation
    $clone.find('img.twitter-emoji, img.Emoji').each(function(i, el) {
      $(el).replaceWith(el.getAttribute('alt'));
    });

    // Prepend space separator to hidden links
    $clone.find('.twitter-timeline-link.u-hidden').each(function() {
      this.textContent = ' ' + this.textContent;
    });

    return 'RT @' + screenName + ': ' + $clone.text().trim() + '';
  };

  var insertButtons = function () {

    config.buttons.forEach(function(btnConfig){

      $(btnConfig.container).each(function () {

        var $container = $(this);

        if( !! btnConfig.ignore ) {
          if( btnConfig.ignore($container) ) return;
        }

        if ( $container.hasClass('buffer-inserted') ) return;

        $container.addClass('buffer-inserted');

        var btn = btnConfig.create(btnConfig);

        $container.find(btnConfig.after).after(btn);

        if ( !! btnConfig.activator) btnConfig.activator(btn, btnConfig);

        var getData = btnConfig.data;
        var clearData = btnConfig.clear;

        var clearcb = function () {};

        $(btn).click(function (e) {
          e.preventDefault();

          if ($(this).hasClass('disabled'))
            return;

          // allow clear to be called for this button
          clearcb = function () {
            if ( !! clearData ) clearData(btn);
          };

          xt.port.emit("buffer_click", getData(btn));
        });

        xt.port.on("buffer_embed_clear", function () {
          clearcb();
          clearcb = function () {}; // prevent clear from being called again, until the button is clicked again
        });

      });

    });

  };

  /**
   * Remove extra buttons that are not needed or wanted
   */
  var removeExtras = function () {
    $('.replies .buffer-tweet-button').remove();
    $('.inline-reply-tweetbox .buffer-tweet-button').remove();
  };

  var twitterLoop = function twitterLoop() {
    insertButtons();
    removeExtras();
    setTimeout(twitterLoop, 500);
  };

  // Add class for css scoping, try this twice in case the scripts load strangely
  var addBufferClass = function(argument) {
    document.body.classList.add('buffer-twitter');
    setTimeout(addBufferClass, 2000);
  }

  var start = function() {
    addBufferClass();
    twitterLoop();
  };

  // Wait for xt.options to be set
  ;(function check() {
    // If twitter is switched on, start the main loop
    if (!xt.options) {
      setTimeout(check, 0);
    } else if (xt.options['buffer.op.twitter'] === 'twitter') {
      start();
    } else {
      setTimeout(check, 2000);
    }
  }());


}());
