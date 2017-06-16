;(function() {

  /**
   * On Safari, this gets injected in all pages. Since we've got a somewhat intensive
   * loop in there, only run the script on Pinterest sites:
   *
   * - www.pinterest.com
   * - www.pinterest.pt
   * - www.pinterest.de
   */
  var hostname = document.location.hostname;
  if (!/^([^\.]+\.)?pinterest\.(com|pt|de)$/.test(hostname)) return;

  /**
   * Example attribute value (contains both html tags and html entities):
   *
   * "The 10 Buffer Values and How We Act on Them Every Day <a href=\"https://open.buffer.com/buffer-values/?utm_content=buffer3e42a&utm_medium=social&utm_source=pinterest.com&utm_campaign=buffer\" rel=\"nofollow\" target=\"_blank\">open.buffer.com/...</a> / Here&#39;s how to cook..."
   */
  var getDecodedAttribute = function(element, attrName) {
    var attrValue = element.getAttribute(attrName);

    // Strip html tags from attr value (Pinterest stores some html tags in attributes)
    // Using a regex is by no means perfect, but Pinterest only stores simple html tags
    // in there, so it should be solid enough.
    attrValue = attrValue.replace(/<\/?[^>]+(>|$)/g, '');

    // Decode html entities
    attrValue = he.decode(attrValue);

    return attrValue;
  };

  var config = [

    // Stream Pins
    {
      placement: 'pinterest-stream-pins',
      selector: '.Pin.Module .rightSideButtonsWrapper:not(.buffer-inserted)',
      $button: $([
        '<button class="Button BufferButton Module btn rounded" type="button">',
          '<em></em>',
          '<span class="accessibilityText">Buffer</span>',
        '</button>'
      ].join('')),
      insert: function(el) {
        var $actions = $(el);

        // In some cases, Pinterest's DOM manipulations make us lose the .buffer-inserted
        // marker: make sure there's no Buffer button already before inserting a new one.
        var existingButton = $actions.find('.BufferButton:first');
        if (existingButton.length > 0) return existingButton.first();

        var $newActionItem = this.$button.clone();

        $actions
          .addClass('buffer-inserted')
          .append($newActionItem);

        if ($actions.find('.isBrioFlat:first').length > 0) {
          $newActionItem.addClass('isBrioFlat');
        }

        return $newActionItem;
      },
      getData: function(el) {
        var $pin = $(el).closest('.Pin.Module');
        var $img = $pin.find('img').first();
        var image = $img.attr('src');
        var pinLink;
        var pinIdParts;
        var pinId;
        var text;
        var $source;
        var source;
        var pageSource;
        var pinSourceRegex;
        var pinSourceMatches;

        text = getDecodedAttribute($img[0], 'alt');

        $source = $pin.find('.pinNavLink, .NavigateButton, .navigateLink').first();

        // If we haven't found a link, try to get it from the page's source using
        // some regex magic
        if ($source.length === 0) {
          pinLink = $img.closest('a').attr('href');
          pinIdParts = pinLink.split('/');
          pinId = pinIdParts[pinIdParts.length - 2];

          pageSource = document.body.innerHTML;

          // That regex looks into inline JSON to find the "link" field in the pin object
          // that follows that pin's id field. If we ever need something more robust to make
          // sure we get the right "link" field, I've come up with this more involved regex:
          // /"id":\s*"22447698119542969"(?:,\s*"[^"]+":\s*(?:\d+(?:\.\d+)?|\w+|"[^"]+"|{(?:(?:{[^}]*})?|[^}])*}|\[[^]]*]))*,\s*"link":\s*("[^"]+")/i
          pinSourceRegex = RegExp('"id":\\s*"' + pinId + '".*?"link":\\s*("[^"]+")');

          pinSourceMatches = pageSource.match(pinSourceRegex);

          if (pinSourceMatches) source = JSON.parse(pinSourceMatches[1]);
        }

        // If we still haven't found a link, default to the domain name
        if ($source.length === 0 && !source) {
          $source = $pin.find('.pinDomain');
        }

        source = source || $source.attr('href') || $source.text();

        return {
          text: text,
          url: source,
          picture: getFullSizeImageUrl(image),
          placement: this.placement
        };
      }
    },
    // Single Pins
    {
      placement: 'pinterest-single-pin',
      selector: '.PinActionBar:not(.buffer-inserted)',
      $button: $([
        '<button class="Button BufferButton Module btn rounded pinActionBarButton hasText medium" type="button">',
          '<em></em>' + ' ',
          '<span class="buttonText">Buffer</span>',
        '</button>'
      ].join('')),
      insert: function(el) {
        var $actions = $(el);
        var $newActionItem = this.$button.clone();

        var showModalButton = $actions.find('.Button.ShowModalButton:first()');

        $actions.addClass('buffer-inserted');

        if (showModalButton.hasClass('isBrioFlat')) $newActionItem.addClass('isBrioFlat');
        showModalButton.after($newActionItem);

        return $newActionItem;
      },
      getData: function(el) {
        var $img = $(el).parents('.closeupActionBarContainer')
                        .siblings('.closeupContainer')
                        .find('.pinImage');

        var image = $img.attr('src');
        // Grab text from image alt attribute
        var text = getDecodedAttribute($img[0], 'alt');

        var source = $(el).closest('.Closeup').find('.paddedPinLink').attr('href');

        return {
          text: text,
          url: source,
          picture: getFullSizeImageUrl(image),
          placement: this.placement
        };
      }
    },
    // Pin Action Popup Pin
    {
      placement: 'pinterest-pin-popup',
      // Classes get overriden on each render here, so we can't rely on the presence of .buffer-inserted
      selector: 'ul > div > div:not(:has(> .BufferButton))',
      $button: $([
        '<button class="Button BufferButton Module btn rounded isBrioFlat BufferPinPopup" type="button">',
          '<em></em>' + ' ',
          '<span class="accessibilityText">Buffer</span>',
        '</button>'
      ].join('')),
      insert: function(el) {
        var $actions = $(el);
        var $newActionItem = this.$button.clone();

        $actions.append($newActionItem);

        return $newActionItem;
      },
      getData: function(el) {
        var $img = $('.pinToBoard > div > div > div > div > img');

        var image = $img.attr('src');
        var text = getDecodedAttribute($img[0], 'alt');

        // Grab full url from board behind modal if this is an overlay dialog on top of a Pinterest feed
        var $source = $('img[alt="' + text + '"]').first().closest('.pinWrapper').find('.navigateLink');
        var source = $source.attr('href');

        // If that didn't work, the Pin may have been open directly (there's no board in the
        // background): there may be a pinterestapp:source meta tag we'll try to get it from
        if (!source) {
          var $meta = $('meta[name="al:ios:url"][content^="pinterest://add_pin/"]');
          if ($meta.length) {
            var metaContent = $meta.attr('content');
            var matches = metaContent.match(/&source_url=([^&]+)/);

            if (matches) source = matches[1];
          }
        }

        if(!source){
          if(window.location.search){
            var params = window.location.search.split('&');

            var urlIndex = -1;
            for(var i = 0; i < params.length; i++){
              if(params[i].indexOf('url=') > -1){
                urlIndex = i;
                break;
              }
            }

            if(urlIndex > -1){
              source = decodeURIComponent(params[urlIndex].split("=")[1]);
            }
          }

        }

        return {
          text: text,
          url: source,
          picture: getFullSizeImageUrl(image),
          placement: this.placement
        };
      }
    }
  ];

  var insertButton = function(target) {
    $(target.selector).each(function(i, el) {
      var $button = target.insert(el);
      $button.on('click', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        xt.port.emit('buffer_click', target.getData(el));
      })
    });
  };

  var insertButtons = function() {
    config.forEach(insertButton);
  };

  var pinterestLoop = function() {
    insertButtons();

    /**
     * Pinterest mutates the DOM on hover, and we need to insert the button after
     * it has done so. To minimize the visual impact of the Buffer button appearing
     * after hovering, we need to insert the button as fast as possible. This value
     * has proven to be a good tradeof between perceived speed and minimizing the
     * performance impact on the overall page.
     */
    setTimeout(pinterestLoop, 50);
  };

  var start = function() {

    // Add class for css scoping
    document.body.classList.add('buffer-pinterest');

    // Start the loop that will watch for new DOM elements
    pinterestLoop();
  };

  // Make sure we get the fullsize image
  // Example src: 'https://s-media-cache-ak0.pinimg.com/236x/55/1f/ac/551fac47c0dacff21f04012cb5c020cf.jpg'
  var getFullSizeImageUrl = function(url) {
    if (typeof url === 'undefined') return;

    var urlParts = url.split('/');
    var isPinterestImage = urlParts[2].indexOf('pinimg.com') != -1;

    // Non-Pinterest images should already be full-size
    if (!isPinterestImage) return url;

    urlParts[3] = '736x'; // 736 is the Pinterest standard for fullsize images
    return urlParts.join('/');
  };

  // Wait for xt.options to be set
  ;(function check() {
    // If Pinterest is switched on, start the main loop
    if (!xt.options) {
      setTimeout(check, 0);
    } else if (xt.options['buffer.op.pinterest'] === 'pinterest' || typeof xt.options['buffer.op.pinterest'] == 'undefined') {
      start();
    } else {
      setTimeout(check, 2000);
    }
  }());

}());
