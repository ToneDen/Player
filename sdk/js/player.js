define(['jquery', 'vendor/simple-slider', 'underscore', 'vendor/sc-player', 'vendor/handlebars', 'hbs!templates/player', 'templates/helpers/msToTimestamp', 'vendor/d3'], function($, SimpleSlider, _, scPlayer, Handlebars, template, msToTimestamp, d3) {
    return function(urls, dom, options) {
        var staticUrl = '//widget.dev/sdk/';

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

        function rerender(parameters) {
            parameters = JSON.parse(JSON.stringify(parameters));
            parameters.staticUrl = staticUrl;

            if(parameters.nowPlaying) {
                for(var i = 0; i < parameters.tracks.length; i++) {
                    if(parameters.tracks[i].title === parameters.nowPlaying.title) {
                        parameters.tracks[i].playing = true;
                    }
                }
            }

            log(parameters);

            container.html(template(parameters));

            container.find('.scrubber-slider').simpleSlider({
                highlight: true
            });
        }

        function drawEQ(data) {
            if(!data) {
                var data = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
            }

            var svg_line;
            var d3Container = d3.select(container[0]);
            var chart = d3Container.select('.waveform svg');

            var n = 32;
             
            var margin = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            };

            var width = container.find('.cover').width();
            var height = container.find('.cover').height();
            var barWidth = width / n;
             
            var x = d3.scale.linear()
                .domain([0, n - 1])
                .range([0, width]);
             
            var y = d3.scale.linear()
                .domain([0, 1])
                .range([0, height]);

            if(!chart.node()) {
                chart = d3Container.select('.waveform').append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g');
                    //.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                chart.selectAll('rect')
                    .data(data)
                    .enter().append('rect')
                    .attr('x', function(d, i) {
                        return x(i);
                    })
                    .attr('y', function(d) {
                        return height - y(d);
                    })
                    .attr('width', barWidth)
                    .attr('height', function(d) {
                        return y(d);
                    });
            }

            /*svg_line = d3.svg.line()
                // .interpolate('basis')
                .x(function(d, i) { return x(i); })
                .y(function(d, i) { return y(d); });
            
            chart.selectAll('path')
                .data([data])
                .enter()
                .append('svg:path')
                .attr('d', svg_line);*/


            function redrawEQ(svg, data) {
                /*svg.selectAll('path')
                    .data([data])
                    .attr('d', svg_line)
                    .transition()
                        .ease('linear')
                        .duration(1000)*/
                chart.selectAll('rect')
                    .data(data)
                    .transition()
                    .duration(100)
                    .attr('y', function(d) {
                        return height - y(d);
                    })
                    .attr('height', function(d) {
                        return y(d);
                    });
            }

            redrawEQ(chart, data);
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
            rerender({
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
            playerInstance.play();
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
        });

        playerInstance.on('scplayer.playlist.preloaded', function(e) {
            log('All tracks loaded.');

            playerInstance.tracks(function(tracks) {
                log(tracks);
                rerender({
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
                rerender({
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
