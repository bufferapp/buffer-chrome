;(function() {
  chrome.runtime.onConnect.addListener(function(rawPort) {
    // PortWrapper(port) exposes an on/emit API for Chrome ports.
    // We are waiting for a trigger, buffer_click, to create the overlay.
    var port = PortWrapper(rawPort);

    // In most cases we'll want to simply open the overlay when a Buffer button
    // is clicked. In some specific cases, we'll want to provide a more tailored
    // experience, e.g. retweeting a tweet when we're on a tweet's permalink page
    // and the Buffer toolbar button is clicked
    port.on("buffer_click", function(postData) {
      var isTweetPermalinkPage = /twitter\.com\/[^/]+\/status\/\d+/.test(window.location.href);
      var $retweetButton = $('.permalink-tweet .ProfileTweet-action--buffer');

      var shouldTriggerRetweetButtonClick = (
        isTweetPermalinkPage &&
        postData.placement === 'toolbar' &&
        $retweetButton.length > 0
      );

      if (shouldTriggerRetweetButtonClick) {
        $retweetButton.click();
      } else {
        // bufferData is a method in buffer-overlay that creates
        // the overlay and gives it data.
        bufferData(port, postData);
      }
    });
  });
}());
