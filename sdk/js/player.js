define(['vendor/jquery', 'vendor/sc-player', 'hbs!templates/player'], function($, scPlayer) {
    return function(tracks, dom, options) {
        var playerInstance = scPlayer(tracks);

        console.log(':D');
    };
});
