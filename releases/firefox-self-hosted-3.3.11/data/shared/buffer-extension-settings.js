;(function(){

  /**
   * Attaches a click handler to the page to listen for special settings 
   * button clicks in the buffer webapp.
   */

  document.addEventListener('click', function(e){
    if (e.target.hasAttribute('data-buffer-extension-open-settings')) {
      e.preventDefault();
      xt.port.emit('buffer_open_settings');
    }
  }, false);

}());