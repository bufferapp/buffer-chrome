/* globals key */

// requires keymaster.js

;(function () {
    
    // Wait for xt.options to be set
  ;(function check() {
    // If hotkey is switched on, add the buttons
    if( xt.options && xt.options['buffer.op.key-enable'] === 'key-enable') {
      key(xt.options['buffer.op.key-combo'], function () {
        xt.port.emit("buffer_click", {placement: 'hotkey'});
        return false;
      });
    } else {
      setTimeout(check, 50);
    }
  }());
    
}());
