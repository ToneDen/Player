require.config({
    paths: {
        jquery: 'vendor/jquery',
        soundmanager2: 'vendor/soundmanager2-nodebug-jsmin'
    },
    shim: {
        soundmanager2: {
            exports: 'soundManager'
        }
    }
});

(function(exports) {
    define(['player'], function(player) {
        return {
            player: player
        };
    });
}(this));
