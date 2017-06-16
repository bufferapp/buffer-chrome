// This is an exact copy of buffer-web/*/buffermetrics.js
// Since this file changes very rarely, it was deemed easier and less error-prone
// to simply copy it here to make it available from extensions.

// deps:
// jquery

/**
 * _bmq - BufferMetricsQueue
 *
 * Track data in the metrics database.
 *
 * Usage:
 *   _bmq.push([ metric, value, type ], [ metric, value, type ]);
 *
 * By default, type is 'set' which sets a given metric to the given value in
 * the user_metrics collection. ex.
 *
 *   _bmq.push(['viewed_upgrade_modal', { time: new Date(), location: 'analytics_tab' }]);
 *
 * Will set a parameter for the given user's document in the user_metrics collection
 * with the data passed.
 *
 * Optionally, the type can be 'event' which can track event based data for
 * experiments or various tracking.
 *
 *   _bmq.push(['track_modal', { clicked: true, modal: 'upgrade' }, 'event']);
 *
 * Will create a new document in the 'event.track_modal' collection with data
 * including the time, the user id and the value/data object passed (clicked: true, etc.)
 *
 * _bmq.push returns the ajax request itself, so in turn, it is a promise to add
 * callbacks. ex.
 *
 *   _bmq.push(['some_metric', 10])
 *     .then(function(){ console.log('Request has finished!') });
 *
 * To track in the actions_taken collection, there is a shorthand method where
 * you can pass the array scope as the first argument and an object with extra
 * data as the optional second argument. ex.
 *
 *   _bmq.trackAction(['my_view', 'shuffle'], { dayOfWeek: (new Date()).getDay() })
 *
 */
;(function(window, $, undefined) {

  // Get the existing _bmq array
  var existingQueue = window._bmq || [];

  // Send any metrics that were queued up before this script loaded
  if (!Array.isArray(existingQueue)) {
    console.warn('BufferMetricsQueue already instantiated! \n' +
                 'Please remove duplicate buffermetrics.js script ;)');
    return;
  }


  var BufferMetricsQueue = function () {

    this.push = function () {

      var params = {}; // the eventual params object we'll send with $.post

      var metrics = []; // array of metrics names
      var values = []; // array of values of the metrics
      var types = []; // array of types for the metrics
      var tracking_user_ids = []; // array of user ids for the metrics

      // loop through collected tracking requests
      for (var i = 0; i < arguments.length; i++) {

        // collect the parameters for the call
        var metric = arguments[i][0] || false;
        var value = arguments[i][1] || false;
        var type = arguments[i][2] || 'set';
        var tracking_user_id = arguments[i][3] || false;

        if (metric !== false && value !== false) {
          metrics.push(metric);
          values.push(value);
          types.push(type);
          tracking_user_ids.push(tracking_user_id);
        }

      }

      // If seamless add via parameter to append client_id on the backend
      if(types.indexOf('seamless') > -1 && metrics.indexOf('actions_taken') > -1 && buffer.application){
        var viaMap = {
          'WEB': 'dashboard',
          'OVERLAY': 'extension',
          'ONBOARDING': 'onboarding'
        };
        var via = viaMap[buffer.application];
        values[0].value.unshift(via);
      }

      // gather the metrics arrays into the params object
      params = {metrics: metrics, values: values, types: types, tracking_user_ids: tracking_user_ids};

      // make an ajax call if we need to
      if(metrics.length > 0) {
        return $.post('/ajax/buffermetrics/', params);
      }

    };

    // Shorthand method for tracking actions taken
    this.trackAction = function(scope, extraData) {
      if (!Array.isArray(scope)) {
        throw new Error('First argument should be an array');
      }

      var data = { value: scope };
      if (extraData) data.extra_data = extraData;

      return this.push(['actions_taken', data, 'seamless'])
    };

  };


  // create a new _bmq object
  window._bmq = new BufferMetricsQueue();

  // Execute all of the queued up events
  if (existingQueue.length) {
    window._bmq.push.apply(window._bmq, existingQueue);
  }

}(window, jQuery));
