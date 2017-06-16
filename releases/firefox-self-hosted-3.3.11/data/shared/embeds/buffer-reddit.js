;(function() {

  var config = {};
  config.buttons = [
    {
      text: "buffer",
      container: 'div.entry ul.flat-list',
      className: 'buffer-reddit-button',
      selector: '.buffer-reddit-button',
      data: function (elem) {
        var $entry = $(elem).closest('.entry');
        var $articleLink = $entry.find('a.title');
        var title;
        var $link;
        var link;
        var image;

        // Buffering an article
        if ($articleLink.length) {
          title = $articleLink.text().trim();
          $link = $articleLink;
        // Buffering a comment
        } else {
          $link = $entry.find('a.bylink').first();
          title = $entry.find('.usertext-body').text();
        }

        link = $link.attr('href').trim();
        image = $(elem).closest('.thing').find('.thumbnail img').attr('src');

        // Resolve link if it's relative
        if (link && link[0] == '/') {
          link = window.location.protocol + '//' + window.location.host + link;
        }

        return {
          text: title,
          url: link,
          image: image,
          placement: 'reddit-add'
        };
      }
    }
  ];

  var createButton = function (btnConfig) {

    var a = document.createElement('a');
    a.setAttribute('class', btnConfig.className);
    a.setAttribute('href', '#');
    $(a).text(btnConfig.text);

    var li = document.createElement('li');
    li.appendChild(a);

    return li;

  };

  var insertButtons = function () {

    var i, l=config.buttons.length;
    for ( i=0 ; i < l; i++ ) {

      var btnConfig = config.buttons[i];

      $(btnConfig.container).each(function () {

        var container = $(this);

        if ( $(container).hasClass('buffer-inserted') ) return;

        $(container).addClass('buffer-inserted');

        var btn = createButton(btnConfig);

        $(container).append(btn);

        var getData = btnConfig.data;

        $(btn).click(function (e) {
          xt.port.emit("buffer_click", getData(btn));
          e.preventDefault();
        });

      });

    }

  };

  // Wait for xt.options to be set
  ;(function check() {
    // If reddit is switched on, add the buttons
    if( xt.options && xt.options['buffer.op.reddit'] === 'reddit') {
      insertButtons();
    } else {
      setTimeout(check, 2000);
    }
  }());

}());
