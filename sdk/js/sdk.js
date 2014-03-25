require.config({
    namespace: 'ToneDen',
    paths: {
        hbs: 'vendor/hbs',
        jquery: 'vendor/jquery',
        soundmanager2: 'vendor/soundmanager2',
        underscore: 'vendor/underscore',
        dsp: 'vendor/dsp'
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
    style.type = 'text/css';
    css = css.replace(/\}/g, "}\n");

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
