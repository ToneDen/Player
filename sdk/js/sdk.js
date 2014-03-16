require.config({
    namespace: 'ToneDen',
    paths: {
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

    return {
        player: player
    };
});
