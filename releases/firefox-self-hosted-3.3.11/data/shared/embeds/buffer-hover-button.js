/**
 * Buffer share buttons visible on hover
 */
;(function(){

  /**
   * Prevent from being inserted in certain situations
   */
  // Do not insert for iframes
  if (window !== window.parent) return;
  // Do no insert for content editing windows
  if (!document.body || document.body.hasAttribute('contenteditable')) return;


  /**
   * Site detection
   */
  var domain = window.location.hostname.replace('www.','');
  var site = {
    isGmail: /mail.google.com/.test(domain),
    isInstagram: /instagram.com/.test(domain)
  };

  // List of sites to disable this on:
  var disabledDomains = [
    'buffer.com',
    'bufferapp.com',
    'twitter.com',
    'facebook.com'
  ];
  if (disabledDomains.indexOf(domain) > -1) {
    return;
  }

  /**
   * Create a single global button
   */
  var currentImageUrl = null;
  var buttonWidth = 100;
  var buttonHeight = 25;
  var dpr = window.devicePixelRatio;
  var backgroundImage = (dpr && dpr > 1) ?
    xt.data.get('data/shared/img/buffer-hover-icon@2x.png') :
    xt.data.get('data/shared/img/buffer-hover-icon@1x.png');
  var isButtonVisible = false;

  var button = document.createElement('span');
  button.id = 'buffer-extension-hover-button';

  button.style.cssText = [
    'display: none;',
    'position: absolute;',
    'z-index: 8675309;',
    'width: ' + buttonWidth + 'px;',
    'height: ' + buttonHeight + 'px;',
    'background-image: url(' + backgroundImage +');',
    'background-size: ' + buttonWidth +'px ' + buttonHeight + 'px;',
    'opacity: 0.9;',
    'cursor: pointer;'
  ].join('');

  var offset = 5;
  var image;
  var box;

  var showButton = function(e) {
    image = e.target;

    box = image.getBoundingClientRect();
    if (box.height < 250 || box.width < 350) return;

    button.style.display = 'block';
    currentImageUrl = getImageUrl(image);
    isButtonVisible = true;
  };

  var locateButton = function() {
    box = image.getBoundingClientRect();

    // Use image.width and height if available
    var width = image.width || box.width,
        height = image.height || box.height,
        extraXOffset = 0,
        extraYOffset = 0;

    // In Gmail, we slide over the button for inline images to not block g+ sharing
    if (site.isGmail &&
        window.getComputedStyle(image).getPropertyValue('position') !== 'absolute') {
      extraXOffset = 83;
      extraYOffset = 4;
    }

    var x = window.pageXOffset + box.left + width - buttonWidth - offset - extraXOffset;
    var y = window.pageYOffset + box.top + height - buttonHeight - offset - extraYOffset;

    // If body is positioned, the button will be positioned against it. So, if body is positioned and shifted
    // up or down, or is being shifted up or down by a children having a top margin other than 0, account for
    // that additional vertical offset.
    var isBodyPositioned = window.getComputedStyle(document.body).getPropertyValue('position') != 'static';
    if (isBodyPositioned) {
      var bodyTopOffset = document.body.getBoundingClientRect().top + window.pageYOffset;
      y -= bodyTopOffset;
    }

    button.style.top = y + 'px';
    button.style.left = x + 'px';
  };

  var hoverButton = function() {
    button.style.opacity = '1.0';
    button.style.display = 'block';
    setPabloButtonVisibilityState(true);
  };

  var hideButton = function(e) {
    button.style.display = 'none';
    button.style.opacity = '0.9';
    isButtonVisible = false;
  };

  var onMouseleaveButton = function() {
    setPabloButtonVisibilityState(false);
    hideButton();
  };

  var onImageMouseEnter = function(e) {
    showButton(e);
    locateButton();
  };

  // If the Pablo extension is active on that page, manage its visibility state
  // by dispatching events to the underlying image
  var setPabloButtonVisibilityState = function(shouldMakeVisible) {
    // Check if the Pablo extension is active on that page
    var pabloHoverButton = document.getElementById('pablo-extension-hover-button');
    if (!pabloHoverButton) return;

    // jQuery listens to mouseover to emulate mouseenter, and mouseout to emulate mouseleave
    var eventName = shouldMakeVisible ? 'mouseover' : 'mouseout';
    var event = new Event(eventName, { bubbles: true });
    image.dispatchEvent(event);
  };

  var onScroll = function() {
    if (isButtonVisible) locateButton();
  };

  var bufferImage = function(e) {
    if (!currentImageUrl) return;

    e.preventDefault();

    xt.port.emit('buffer_click', {
      picture: currentImageUrl,
      placement: 'hover_button_image'
    });
  };

  $(button)
    .on('click', bufferImage)
    .on('mouseenter', hoverButton)
    .on('mouseleave', onMouseleaveButton);


  var getImageUrl = (function(domain){

    if ( site.isInstagram ) {
      return function(el) {
        return el.style.backgroundImage
          .replace('url(','')
          .replace(')','');
      };
    }

    return function(el) {
      return el.src;
    };

  }(domain));

  var addBufferImageOverlays = function() {
    var selector = 'img';

    if ( site.isInstagram ) {
      selector = '.Image.timelinePhoto, .Image.Frame';
    }

    document.body.appendChild(button);

    $(document)
      .on('mouseenter', selector, onImageMouseEnter)
      .on('mouseleave', selector, hideButton);

    // scroll events don't bubble, so we listen to them during their capturing phase
    window.addEventListener('scroll', onScroll, true);
  };


  (function check() {
    if (!xt.options) {
      return setTimeout(check, 50);
    }
    if (typeof xt.options['buffer.op.image-overlays'] === 'undefined' ||
        xt.options['buffer.op.image-overlays'] === 'image-overlays') {
      addBufferImageOverlays();
    }
  }());

}());
