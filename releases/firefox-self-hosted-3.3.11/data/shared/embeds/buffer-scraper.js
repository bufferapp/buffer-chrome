;(function () {

  // Utility functions
  function rtrim (str, charlist) {
    // Removes trailing whitespace
    //
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/rtrim
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Erkekjetter
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   input by: rem
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // *     example 1: rtrim('    Kevin van Zonneveld    ');
    // *     returns 1: '    Kevin van Zonneveld'
    charlist = !charlist ? ' \\s\u00A0' : (charlist + '').replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\\$1');
    var re = new RegExp('[' + charlist + ']+$', 'g');
    return (str + '').replace(re, '');
  }

  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if(results == null)
    return undefined;
    else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  // Info
  var scraper = {};
  scraper.base = window.location.protocol + "//" + window.location.hostname + "/";
  scraper.path = document.location.pathname;
  scraper.url = document.location.href;
  scraper.scanned = 0;

  var config = {};
  config.banned = [
    'http://ds.issuemediagroup.com'
  ];
  config.need = 8;

  var calcGCD = function(size) {
    var a = size.x, b = size.y;
    var remainder = 0;
    while (b !== 0) {
      remainder = a % b;
      a = b;
      b = remainder;
    }
    return Math.abs(a);
  };

  var calcAspect = function(size) {
    if ( ! size.x || ! size.y ) return 1;
    var gcd = calcGCD(size);
    return (size.x / gcd) / (size.y / gcd);
  };

  // Filter out unwanted images
  var filterImage = function (img) {

    var src, height = $(img).width(), width = $(img).height(), aspect;

    src = $(img).get(0).src;

    if (!src) return false;

    aspect = calcAspect({x: width, y: height});

    if( height < 50 || width < 85 || aspect < 0.4 || aspect > 4 ) { return false; }

    return {
      url: src,
      title: $(img).attr('title'),
      height: height,
      width: width
    };

  };
  
  // Retrieve & filter images from current page
  var getImages = function () {
    
    // All images
    var images = $('img'), filtered = [], srcs = {};

    // Grab the open graph image
    var ogimage = $('meta[property="og:image"]');
    var ogtmp;
    if( ogimage.length > 0 ) {
      ogtmp = $('<img>').prop({
        'src': $(ogimage).text(),
        'class': 'opengraph',
        'width': 1000, // High priority
        'height': 1000
      });
      images.push(ogtmp);
    }

    // Cycle through all images
    var i = 0, l=images.length, result, img;
    for(; i < l; i++) {

      scraper.scanned += 1;

      img = images[i];

      // Have we seen this image already?
      if( !! srcs[$(img).attr('src')] ) {
        // Yep, skip it
        continue;
      } else {
        // Nope, remember it
        srcs[$(img).attr('src')] = true;
      }

      result = filterImage(img);

      if( result !== false ) {
        filtered.push(result);
      }

    }

    var pow = Math.pow;
    filtered.sort(function (a, b) {
      return pow(pow(b.width, 2) + pow(b.height, 2), 1/2) - pow(pow(a.width, 2) + pow(a.height, 2), 1/2);
    });

    return filtered.slice(0, config.need);

  };

  var getVideoSource = function () {

    var v;
    
    // Youtube
    if( scraper.base.match(/youtube.com/i) ) {
      v = getParameterByName('v');
      if( v ) {
        return 'http://www.youtube.com/v/' + v + '?autoplay=1';
      }
    }

    // Vimeo
    if( scraper.url.match(/vimeo.com\/(\d+)$/i) ) {
      v = scraper.path.split('/')[1];
      return 'https://secure.vimeo.com/moogaloop.swf?clip_id=' + v + '&autoplay=1';
    }

    // Soundcloud
    if( scraper.base.match(/soundcloud.com/i) ) {
      return 'https://player.soundcloud.com/player.swf?url=' + encodeURIComponent(scraper.url) + '&color=3b5998&auto_play=true&show_artwork=false';
    }

    return false;

  };

  var getDescription = function () {
    var text = $('p').first().text().substring(0, 200);
    return $('meta[property="og:description"]').text() || $('meta[name=description]').prop('content') || (text.length > 0 ? text + '...' : false) || '';
  };

  var getDetails = function () {

    var start = (new Date()).getTime();

    var data = {
      original: scraper.url,
      title: $('meta[property="og:title"]').prop('content') || document.title || $('h1').first().text() || '',
      description: getDescription(),
      images: getImages(),
      source: getVideoSource()
    };

    data.details = {
      process: ((new Date()).getTime() - start) + 'ms',
      scanned: scraper.scanned
    };

    return data;

  };

  // Wait for a request for data
  xt.port.on("buffer_details_request", function() {
    xt.port.emit("buffer_details", getDetails());
  });
  // Tell the background page which port to use
  // to get data from the scraper
  xt.port.emit("buffer_register_scraper");
}());