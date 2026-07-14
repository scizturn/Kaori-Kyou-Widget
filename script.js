;(function () {
  'use strict';

  // This file is a loader, not the widget. The widget is kaori-widget.js, next to it.
  //
  // WordPress loads this file from
  //   https://cdn.jsdelivr.net/gh/scizturn/Kaori-Kyou-Widget@master/script.js
  // and that URL is not ours to change. jsDelivr serves it with `max-age=604800`, so a reader
  // who has already opened one Kaori article keeps their copy for SEVEN DAYS without touching
  // the network -- and resolves `@master` to a commit only every 12 hours on top of that.
  // Nothing can purge either one. Not us, not jsDelivr, not Cloudflare: the header has already
  // been handed to the browser.
  //
  // So the file at that URL can never be the thing we ship. It has to be a file we are happy to
  // have frozen for a week -- which is exactly what this is. It should essentially never change
  // again. The widget itself moves to kyoucdn.id, where we own the cache headers and can purge
  // in seconds, and every future release lands there instead of here.
  //
  // The fallback matters: if the CDN copy is missing or unreachable, we load the copy that ships
  // in this very repo. That keeps a bad upload -- or an outage -- from taking the widget off
  // every article on the site, and it means this loader is safe to ship before the CDN copy
  // even exists.

  var PRIMARY = 'https://kyoucdn.id/kaori-widget.js';
  var FALLBACK = 'https://cdn.jsdelivr.net/gh/scizturn/Kaori-Kyou-Widget@master/kaori-widget.js';

  if (document.getElementById('kaori-kyou-widget-loader')) {
    return;
  }

  load(PRIMARY, function () {
    load(FALLBACK, null);
  });

  function load(src, onFail) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.id = 'kaori-kyou-widget-loader';

    if (onFail) {
      script.onerror = function () {
        // Let the fallback claim the id, or it would bail out on the guard above.
        script.id = '';
        onFail();
      };
    }

    (document.head || document.documentElement).appendChild(script);
  }
})();
