require.config({
    namespace: 'ToneDen',
    paths: {
        hbs: 'vendor/hbs',
        jquery: 'vendor/jquery',
        soundmanager2: 'vendor/soundmanager2'
    },
    shim: {
        handlebars: {
            exports: 'Handlebars'
        },
        soundmanager2: {
            exports: 'soundManager'
        }
    }
});

//(function(exports) {
    define(['player'], function(player) {
        return {
            player: player
        };
    });
//})(this);
