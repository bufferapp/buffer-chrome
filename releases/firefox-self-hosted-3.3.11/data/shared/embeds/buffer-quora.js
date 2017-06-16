;(function() {

  // Only run this script on twitter:
  if ( window.location.host.indexOf('quora.com') === -1 ) return;

  var config = {};
  config.buttons = [
    {
      text: 'Buffer',
      container: '.item_action_bar',
      after: '.share_link',
      before: '.downvote',
      containerClassName: 'buffer-quora-button-container',
      separatorClassName: 'bullet',
      separatorText: ' &bull; ',
      className: 'buffer-quora-button',
      data: function (element) {
        
        var title, link, placement, $parent, $author;
        
        var $title = $('.question h1').clone();
        var isQuestionPage = !!$title.length;

        // Question page
        if (isQuestionPage) {

          $parent = $(element).parents('.answer_text_wrapper');
          $author = $parent.find('.answer_user_wrapper a.user');

          // Find and sanitize a question title
          $title.find('div').remove();
          title = $title.text();

          // Just grab the current page URL, we don't need to do voodoo here
          link = window.location.href.replace(window.location.search,'');
          placement = 'quora-page';

        // Home page feed
        } else {

          $parent = $(element).parents('.feed_item');
          $author = $parent.find('.feed_item_answer_user a.user');

          // Find and sanitize a question title
          var $question = $parent.find('.feed_item_question .link_text').clone();
          $question.find('div, span').remove();
          title = $question.text();

          // Prefix link with the domain URL as we only have an URI
          link = 'https://www.quora.com' + $parent.find('a.question_link').attr('href');
          placement = 'quora-feed';
        }

        // If it's an answer...
        if ($author.length) {
          title = 'Answer by ' + $author.text() + ' to ' + title;
          placement += '-answer';

          // If it's not an answer page, construct the author's answer url:
          if (link.search(/\/answer\//)) {
            if (link[ link.length - 1 ] !== '/') link += '/';
            link += 'answer' + $author.attr('href');
          }
          
        } else {
          placement += '-question';
        }

        return {
          text: title,
          url: link,
          placement: placement
        };

      }
    }
  ];

  var createButton = function (cfg) {

    // Buffer link itself
    var a = document.createElement('a');
    // share_link is added for styling purposes
    a.setAttribute('class', cfg.className + ' share_link');
    a.setAttribute('href', '#');
    $(a).text(cfg.text);

    // Quora style button separator
    var bullet = document.createElement('span');
    bullet.setAttribute('class', cfg.separatorClassName);
    $(bullet).html(cfg.separatorText);

    // Container for button and separator
    var c = document.createElement('span');
    c.setAttribute('class', cfg.containerClassName);
    $(c).append(bullet).append(a);

    return c;
  };

  var insertButtons = function () {

    config.buttons.forEach(function(btnConfig, i){

      $(btnConfig.container).each(function(){

        var $container = $(this);

        // If we don't have Share link in the action bar prevent inserting Buffer button
        // This usually happens when user is not logged in
        if ($container.hasClass('buffer-inserted')) {
          return;
        }

        var button = createButton(btnConfig);

        var getData = btnConfig.data;

        $(button).children('a.share_link').on('click', function (e) {
          xt.port.emit('buffer_click', getData(button));
          e.preventDefault();
        });

        $container.addClass('buffer-inserted');

        // We check for the share count
        var hasShareCount = !!$container.find('.repost_count_link').length;
        if (!hasShareCount) {
          $container.find(btnConfig.after).after(button);
          return;
        }

        // If it has the Downvote, we insert before that element's 
        // previous element
        var $before = $container.find(btnConfig.before);

        if ($before.length) {
          $before
            .parent()
            .prev()
            .before(button);
          return;
        }

        $container.append(button);
      });

    });

    setTimeout(insertButtons, 800);
  };

  ;(function check(){
    if (!xt.options) {
      return setTimeout(check, 50);
    }
    if (typeof xt.options['buffer.op.quora'] === 'undefined' ||
        xt.options['buffer.op.quora'] === 'quora') {
      insertButtons();
    }
  }());

}());
