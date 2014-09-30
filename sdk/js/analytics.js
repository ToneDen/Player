define(function(require) {
    var trackerName = 'ToneDenTracker';

    if(!window.ga) {
        (function(i, s, o, g, r, a, m){
          i['GoogleAnalyticsObject'] = r; // Acts as a pointer to support renaming.

          // Creates an initial ga() function.  The queued commands will be executed once analytics.js loads.
          i[r] = i[r] || function() {
            (i[r].q = i[r].q || []).push(arguments)
          },

          // Sets the time (as an integer) this tag was executed.  Used for timing hits.
          i[r].l = 1 * new Date();

          // Insert the script tag asynchronously.  Inserts above current tag to prevent blocking in
          // addition to using the async attribute.
          a = s.createElement(o),
          m = s.getElementsByTagName(o)[0];
          a.async = 1;
          a.src = g;
          m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
    }

    if(!ga.getByName || !ga.getByName(trackerName)) {
        ga('create', 'UA-55279667-1', 'auto', {
            cookieDomain: 'none',
            name: trackerName
        });

        return ga;
    } else {
        return ga.getByName(trackerName);
    }
});
