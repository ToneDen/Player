define(['jquery', 'underscore', 'vendor/sc-player', 'vendor/handlebars', 'hbs!templates/player'], function($, _, scPlayer, Handlebars, template) {
    var staticUrl = '//widget.dev/sdk/';

    function rerender(container, parameters) {
        parameters = JSON.parse(JSON.stringify(parameters));
        parameters.staticUrl = staticUrl;

        if(parameters.nowPlaying) {
            for(var i = 0; i < parameters.tracks.length; i++) {
                if(parameters.tracks[i].title === parameters.nowPlaying.title) {
                    parameters.tracks[i].playing = true;
                }
            }
        }

        container.html(template(parameters));
    }

    return function(urls, dom, options) {
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
            parameters.urls = urls;
            parameters.dom = dom;

            delete options.urls;
            delete options.dom;

            _.extend(parameters, options);
        }

        var dom = parameters.dom;
        var urls = parameters.urls;

        var container = $(dom);

        if(container) {
            rerender(container, {
                tracks: []
            });
        } else {
            console.error('ToneDen Player: the container specified does not exist.');
            return;
        }

        // Helper functions.
        function changePlayButton(paused) {
            var playClass = 'fa-play-circle-o';
            var pauseClass = 'fa-pause';
            var playButton = container.find('.play');

            if(paused) {
                playButton.removeClass(pauseClass);
                playButton.addClass(playClass);
            } else {
                playButton.removeClass(playClass);
                playButton.addClass(pauseClass);
            }
        }

        var playerInstance = new scPlayer(urls, playerParameters);
        var titleArea = container.find('.title');

        // Set up listeners.
        container.on('click', '.controls', function(e) {
            e.preventDefault();
            var target = $(e.target);

            if(target.hasClass('play')) {
                playerInstance.pause();
            } else if(target.hasClass('next')) {
                playerInstance.next();
            } else if(target.hasClass('prev')) {
                playerInstance.prev();
            }
        });

        container.on('click', '.track-info', function(e) {
            var row = $(this);
            var cls = row.attr('class');
            var index = Number(row.attr('data-index'));

            if(cls.indexOf('playing') === -1) {
                playerInstance.goto(index);
            }
        });

        // Hook into SC player events.
        playerInstance.on('scplayer.play', function(e) {
            changePlayButton(false);
        });

        playerInstance.on('scplayer.pause', function(e) {
            var paused = playerInstance.sound().paused;
            changePlayButton(paused);
        });

        playerInstance.on('scplayer.stop', function(e) {
            container.find('.play').attr('src', staticUrl + 'img/play.png');
        });

        playerInstance.on('scplayer.track.whileloading', function(e, percent){
            container.find('.buffer').css('width', percent + '%');
        });

        playerInstance.on('scplayer.track.whileplaying', function(e, percent){
            container.find('.played').css('width', percent + '%');
        });

        playerInstance.on('scplayer.playlist.preloaded', function(e) {
            playerInstance.tracks(function(tracks) {
                rerender(container, {
                    nowPlaying: playerInstance.track(),
                    tracks: tracks
                });
            });
        });

        playerInstance.on('scplayer.changing_track', function(e, trackIndex) {
            container.find('.played').css('width', '0%');
            container.find('.buffer').css('width', '0%');

            playerInstance.tracks(function(tracks) {
                rerender(container, {
                    nowPlaying: playerInstance.track(),
                    tracks: tracks
                });
            });
        });

        //Interactions

        return playerInstance;
    };
});
