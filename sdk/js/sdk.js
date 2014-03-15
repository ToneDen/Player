require.config({
    namespace: 'ToneDen',
    paths: {
        hbs: 'vendor/hbs',
        soundmanager2: 'vendor/soundmanager2'
    },
    shim: {
        soundmanager2: {
            exports: 'soundManager'
        }
    }
});

define(['player'], function(player) {
    return {
        player: player
    };
});
