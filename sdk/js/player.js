define(['jquery', 'vendor/simple-slider', 'underscore', 'vendor/sc-player', 'vendor/handlebars', 'hbs!templates/player'], function($, SimpleSlider, _, scPlayer, Handlebars, template) {
    var staticUrl = '//widget.dev/sdk/';

    function rerender(container, parameters) {
        parameters = JSON.parse(JSON.stringify(parameters));
        parameters.staticUrl = staticUrl;

        if(parameters.nowPlaying) {
            for(var i = 0; i < parameters.tracks.length; i++) {
                if(parameters.tracks[i].title === parameters.nowPlaying.title) {
                    parameters.tracks[i].playing = true;
                    container.find('.stop-time').html(parameters.tracks[i].duration);
                }
            }
        }

        container.html(template(parameters));

        container.find('.scrubber-slider').simpleSlider({highlight: true});
    }

    function msToTimestamp(milliseconds) {
        var totalSeconds = Math.round(milliseconds / 1000);
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds - minutes * 60;

        return minutes + ':' + seconds;
    }

    return function(urls, dom, options) {
        // Default parameters go here.
        var parameters = {
            debug: false,
            skin: 'light',
            tracksPerArtist: 5
        };

        // Setup the parameters object with the given arguments and
        // override the default parameters with the given options.
        if(arguments.length === 1 && typeof arguments[0] === 'object') {
            _.extend(parameters, arguments[0]);
        } else {
            parameters.urls = urls;
            parameters.dom = dom;

            delete options.urls;
            delete options.dom;

            _.extend(parameters, options);
        }

        // Parameters for the SoundCloud player.
        var playerParameters = {
            consumerKey: '6f85bdf51b0a19b7ab2df7b969233901',
            debug: parameters.debug,
            preload: true,
            togglePause: true,
            tracksPerArtist: parameters.tracksPerArtist
        }

        var dom = parameters.dom;
        var urls = parameters.urls;

        var container = $(dom);

        // Helper functions.
        function log(message, isError) {
            if(window.console) {
                if(!isError && parameters.debug) {
                    console.log(message);
                } else if(level === 'error') {
                    console.error(message);
                }
            }
        }

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

        if(container) {
            rerender(container, {
                tracks: []
            });
        } else {
            log('ToneDen Player: the container specified does not exist.', 'error');
            return;
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

        container.bind('slider:changed', 'scrubber-slider', function(e, slider) {
            playerInstance.seek(slider.ratio);
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

        playerInstance.on('scplayer.track.whileloading', function(e, percent) {
            container.find('.buffer').css('width', percent + '%');
        });

        playerInstance.on('scplayer.track.whileplaying', function(e, percent) {
            var ratio = percent / 100;
            var timeIn = msToTimestamp(playerInstance.position());
            var timeLeft = msToTimestamp(playerInstance.track().duration - playerInstance.position());

            container.find('.scrubber-slider').simpleSlider('setRatio', ratio, true);
            container.find('.start-time').html(timeIn);
            container.find('.stop-time').html(timeLeft);
        });

        playerInstance.on('scplayer.playlist.preloaded', function(e) {
            playerInstance.tracks(function(tracks) {
                log(tracks);
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
        console.log(playerInstance);
        return playerInstance;
    };
});
