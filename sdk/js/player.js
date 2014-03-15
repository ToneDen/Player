define(['vendor/jquery', 'vendor/sc-player', 'hbs!templates/player'], function($, scPlayer, template) {
    return function(tracks, dom, options) {
        var html = template({
            tracks: tracks
        });

        if(dom) {
            $(dom).html();
        }

        var playerInstance = scPlayer(tracks);

        return playerInstance;
    };
});
