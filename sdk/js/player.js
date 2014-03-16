define(['jquery', 'underscore', 'vendor/sc-player', 'hbs!templates/player'], function($, _, scPlayer, template) {
    return function(tracks, dom, options) {
        // Default parameters go here.
        var parameters = {
        };

        // Parameters for the SoundCloud player.
        var playerParameters = {
            consumerKey: '6f85bdf51b0a19b7ab2df7b969233901',
            debug: false,
            preload: true,
            toggle_pause: true
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
            location.html(html);
        } else {
            console.error('ToneDen Player: the location specified does not exist.');
            return;
        }

        var playerInstance = new scPlayer(tracks, playerParameters);
        var titleArea = location.find('.title');

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

        // Hook into SC player events.
        playerInstance.on('scplayer.changing_track', function(event, trackIndex) {
            var track = playerInstance.track();
            titleArea.html(track.title);
        });

        return playerInstance;
    };
});
