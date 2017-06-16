;(function () {

  // Order important here, as we don't want Chrome to evaluate window.parent.frames, as
  // window.parent will be undefined, but this has to work cross browser.
  //
  // Chrome evaluates window.top !== window as true, but Firefox evaluates it as false
  // because the iframe is placed in its own sandbox.
  var inIframe = (window.top !== window || (window.frames.length === 0 && window.parent.frames.length > 0));

  // Only allow this to run in the Buffer iframe
  if( document.location.host.match(/buffer.com/i) && inIframe ) {

    // Listen for information
    xt.port.on('buffer_details', function (details) {

      // Create an element in the overlay page with the
      // details scraped externally
      var temp = document.createElement('div');
      temp.setAttribute('id', 'page-scraper');
      temp.setAttribute('data-details', escape(JSON.stringify(details)));
      document.body.appendChild(temp);

    });

    // Ask for the details
    xt.port.emit("buffer_details_request");

  }

}());
