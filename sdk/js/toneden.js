require.config({
    // Set up jquery as here: http://requirejs.org/docs/jquery.html#noconflictmap
    map: {
        '*': {
            'jquery': 'vendor/jquery-private'
        },
        'vendor/jquery-private': {
            'jquery': 'jquery'
        }
    },
    namespace: 'ToneDen',
    paths: {
        d3: 'vendor/d3',
        dsp: 'vendor/dsp',
        hbs: 'vendor/hbs',
        jquery: 'vendor/jquery',
        soundmanager2: 'vendor/soundmanager2',
        underscore: 'vendor/underscore'
    },
    shim: {
        soundmanager2: {
            exports: 'soundManager'
        }
    }
});

define(['analytics', 'player'], function(analytics, player) {
    ToneDen.ready = true;

    // Inject CSS into the dom.
    var style = document.createElement('style');
    var css = ToneDenSDKCSS.replace(/\}/g, "}\n");
    style.type = 'text/css';

    if(style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(style, entry);

    // Record initial load event.
    analytics('ToneDenTracker.send', {
        hitType: 'event',
        eventCategory: 'sdk',
        eventAction: 'loaded',
        eventLabel: window.location.href
    });

    return {
        player: player
    };
});
