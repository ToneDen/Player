define(['jquery', 'vendor/simple-slider', 'underscore', 'vendor/sc-player', 'vendor/handlebars', 'hbs!templates/player', 'templates/helpers/msToTimestamp', 'vendor/d3'], function($, SimpleSlider, _, scPlayer, Handlebars, template, msToTimestamp, d3) {
    var staticUrl = '//widget.dev/sdk/';
    var svg;
    var svg_line;

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

        console.log("hi");
        console.log(parameters);

        container.html(template(parameters));

        container.find('.scrubber-slider').simpleSlider({highlight: true});        
    }

    function drawEQ(data) {
        if(!data) {
            var data = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        } else {
            var data = [0.1361162606626749, 0.07157782607828267, 0.025764694961253554, 0.03246627771295607, 0.08847521455027163, 0.026442752219736576, 0.030323196086101234, 0.0218847866053693, 0.030693408683873713, 0.034768179641105235, 0.03734104009345174, 0.03952709608711302, 0.02001303166616708, 0.02404092694632709, 0.030453502520686015, 0.030208346783183515, 0.01673863606993109, 0.017160871473606676, 0.02146214054664597, 0.013027621200308204, 0.017390099848853424, 0.009947492013452575, 0.008884934359230101, 0.012018044828437269, 0.005719061256968416, 0.004763303462823387, 0.002962481608847156, 0.0034158889029640704, 0.003077854446019046, 0.0008949323819251731, 0.001218922381667653, 0.0025467737068538554];
        }

        var n = 32
         
        var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = $(".cover").width(),
            height = $(".cover").height()
         
        var x = d3.scale.linear()
            .domain([0, n - 1])
            .range([0, width]);
         
        var y = d3.scale.linear()
            .domain([0, 1])
            .range([height, 0]);

        if($(".waveform svg").length==0) {
            svg = d3.select(".waveform").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        }
         
        svg_line = d3.svg.line()
            // .interpolate("basis")
            .x(function(d, i) { return x(i); })
            .y(function(d, i) { return y(d); });
        
        svg.selectAll("path")
            .data([data])
            .enter()
            .append("svg:path")
            .attr("d", svg_line);


        function redrawEQ(svg, data) {
            svg.selectAll("path")
                .data([data])
                .attr("d", svg_line)
                .transition()
                    .ease("linear")
                    .duration(1000)
        }

        redrawEQ(svg, data);
        // return svg;
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
            log('Slider Ratio: ' + slider.ratio);

            playerInstance.seek(slider.ratio);
        });

        // Hook into SC player events.
        playerInstance.on('scplayer.play', function(e) {
            log('Playing.');

            changePlayButton(false);
        });

        playerInstance.on('scplayer.pause', function(e) {
            var paused = playerInstance.sound().paused;
            log('Pause state changed: ' + paused);
            changePlayButton(paused);
        });

        playerInstance.on('scplayer.stop', function(e) {
            // log('Stopped.');
            container.find('.play').attr('src', staticUrl + 'img/play.png');
        });

        playerInstance.on('scplayer.track.whileloading', function(e, percent) {
            // log('Loaded: ' + percent + '%');
            container.find('.buffer').css('width', percent + '%');
        });

        playerInstance.on('scplayer.track.whileplaying', function(e, percent, eqData) {
            drawEQ(eqData);
            var ratio = percent / 100;
            var timeIn = msToTimestamp(playerInstance.position());
            var timeLeft = msToTimestamp(playerInstance.track().duration - playerInstance.position());

            container.find('.scrubber-slider').simpleSlider('setRatio', ratio, true);
            container.find('.start-time').html(timeIn);
            container.find('.stop-time').html(timeLeft);
            // redrawEQ(svg, eqData);
        });

        playerInstance.on('scplayer.playlist.preloaded', function(e) {
            log('All tracks loaded.');

            playerInstance.tracks(function(tracks) {
                log(tracks);
                rerender(container, {
                    nowPlaying: playerInstance.track(),
                    tracks: tracks
                });
            });


        });

        playerInstance.on('scplayer.changing_track', function(e, trackIndex) {
            log('New track index: ' + trackIndex);

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
        log(playerInstance);
        return playerInstance;
    };
});
