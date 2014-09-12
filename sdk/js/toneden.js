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
        //async: 'vendor/async',
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

define(['player'], function(player) {
    ToneDen.ready = true;

    // Inject CSS into the dom.
    var style = document.createElement('style');
    var css = ToneDenSDKCSS.replace(/\}/g, "}\n");
    style.type = 'text/css';

    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(style, entry);

    return {
        player: player
    };
});
