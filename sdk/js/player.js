define(['jquery', 'underscore', 'vendor/sc-player', 'hbs!templates/player'], function($, _, scPlayer, template) {
    return function(tracks, dom, options) {
        // Default parameters go here.
        var parameters = {
        };

        // Parameters for the SoundCloud player.
        var playerParameters = {
            consumerKey: '6f85bdf51b0a19b7ab2df7b969233901',
            toggle_pause: true,
            preload: true
        }

        // Setup the parameters object with the given arguments.
        if(arguments.length === 1 && typeof arguments[0] === 'object') {
            _.extend(parameters, arguments[0]);
        } else {
            parameters.tracks = tracks;
            parameters.dom = dom;

            delete options.tracks;
            delete options.dom;

            _.extend(parameters, options);
        }

        var dom = parameters.dom;
        var tracks = parameters.tracks;

        var location = $(dom);
        var html = template({
            tracks: tracks
        });

        if(location) {
            console.log(html);
            location.html(html);
        } else {
            console.error('ToneDen player: the location specified does not exist.');
            return;
        }

        var playerInstance = new scPlayer(tracks, playerParameters);

        // Set up listeners.
        location.find('.controls').on('click', function(e) {
            e.preventDefault();
            var target = $(e.target);

			if(target.hasClass('play')) {
                playerInstance.pause();
            } else if(target.hasClass('pause')) {
                playerInstance.pause();
            } else if(target.hasClass('stop')) {
                playerInstance.stop();
            } else if(target.hasClass('next')) {
                playerInstance.next();
            } else if(target.hasClass('prev')) {
                playerInstance.prev();
            }
        });

        return playerInstance;
    };
});
