/**
 * Refactored from: https://github.com/kilokeith/soundcloud-soundmanager-player
 */
define(['vendor/soundmanager2', 'jquery', 'vendor/jquery-jsonp', 'vendor/d3', 'vendor/async', 'constants'], function(soundManager, $, jqueryjsonp, d3, async, constants) {
    var isSafari = (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) == true;
    //object slice
    __slice = [].slice;

    // Setup soundmanager2.
    if(typeof soundManager !== 'undefined'){
        soundManager.setup({
            debugMode: false,
            flashVersion: 9,
            url: 'swf',
            useFlashBlock: false,
            useHighPerformance: false,
            waitForWindowLoad: true,
            useConsole: true,
            useHTML5Audio: true,
            wmode: 'transparent'
        });
    }

    /* tdplayer EVENTS */
    /*
        tdplayer.init
        tdplayer.play
        tdplayer.pause
        tdplayer.stop
        tdplayer.mute
        tdplayer.position
        tdplayer.volume
        tdplayer.changing_track
        tdplayer.loop_changed

    */
    /* tdplayer PLAYLIST EVENTS */
    /*
        tdplayer.playlist.next
        tdplayer.playlist.looped
        tdplayer.playlist.trackLooped
        tdplayer.playlist.ended
        tdplayer.playlist.prev
        tdplayer.playlist.looped
        tdplayer.playlist.restarted
        tdplayer.playlist.goto
        tdplayer.playlist.preloaded
    */
    /* tdplayer TRACK EVENTS */
    /*
        tdplayer.track.info_loaded
        tdplayer.track.bindable
        tdplayer.track.ready
        tdplayer.track.finished
        tdplayer.track.whileloading
        tdplayer.track.whileplaying
        tdplayer.track.played
        tdplayer.track.paused
        tdplayer.track.resumed
        tdplayer.track.stopped
    */

    //SoundCloud Player class
    //v0.9.6
    var SoundCloudPlayer = function(tracks, config){
        var defaults = {
            autoplay: false,
            autoswitch: true, // For playlists
            cache: true, // Caches the SC track lookup. Browser should handle the audio
            cachePrefix: '', // Prefix to add to cache URLs
            debug: false,
            loop: false,
            loopTrack: false,
            preload: true, // Prefetch the sc track data
            startOn: 0,
            togglePause: true, //Should pause act as a toggle?
            tracksPerArtist: 10, // When given an artist URL, how many tracks to load?
            volume: 100,
            useEQData: true,
            useHTML5Audio: true,
            flashVersion: 9,
            useWaveformData: false
        };

        var flashFallback = false;

        var scResolveUrl = constants.protocol + '//api.soundcloud.com/resolve?url=http://soundcloud.com';
        var scApiUrl = constants.protocol + '//api.soundcloud.com/';
        var urlregex = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);

        var numEqBars = 64;
        var eqBarValues;
        var eqBarValuesLast;
        var eqBarInterval = 256 / numEqBars;
        //keep ref to local scope
        var self = this;
        var $this = $(this);

        //local vars
        this.tracks = [];
        this.config = $.extend(defaults, config);
        this.currentTrackIndex = this.config.startOn;
        this.currentTrack = null;
        this.sound = null;
        this.loopTrack = false;

        soundManager.setup({
            debugMode: config.debug
        });

        //flag for if we're already inited
        this.inited = false;

        //hold a state so when you hit play it'll play on the correct sound when it's ready
        this.playWhenReady = false;
        // Cache for SoundCloud lookups.
        this.cache = {};

        // Initialization function.
        this.init = function(){
            if(self.inited) {
                return;
            }

            self.changeTrack();
            self.trigger('tdplayer.init');

            if(self.config.autoplay) {
                self.play();
            }

            self.inited = true;
        };

        // Load a track from a trimmed SC url
        this.changeTrack = function(index){
            var i;
            var url;

            self.log('changeTrack');

            // Destroy the old sound
            if(self.sound){
                self.sound.destruct();
                self.sound = null;
            }

            if(typeof index !== 'undefined') {
                i = index;
            } else {
                i = self.currentTrackIndex;
            }

            if(index !== self.currentTrackIndex || !index) {
                url = self.tracks[i];
                self.resolveTrack(url, function(track) {
                    self.setSound(track);
                });

                self.trigger('tdplayer.changing_track', i);
            }

            return self;
        }

        /* ---- public methods ---- */

        // Playlist related methods
        this.play = function(){
            self.log('play');

            // If the sound is there and ready, get to it.
            // If not, hold a state to come back to when ready.
            if(self.sound && self.sound.readyState == 3) {
                self.sound.play();
            } else {
                self.playWhenReady = true;
            }

            self.trigger('tdplayer.play', self.currentTrackIndex);

            return self;
        };

        this.pause = function(force){
            if(!force) {
                force = false;
            }

            if(self.sound) {
                if(self.config.togglePause && !force) {
                    self.sound.togglePause();
                } else {
                    self.sound.pause();
                }

                self.trigger('tdplayer.pause', self.sound.paused);
            }

            return self;
        };

        this.resume = function(force){
            if(!force) {
                force = false;
            }

            if(self.sound) {
                if(self.config.togglePause && !force) {
                    self.sound.togglePause();
                } else {
                    self.sound.resume();
                }

                self.trigger('tdplayer.pause', self.sound.paused);
            }

            return self;
        };

        this.stop = function() {
            if(self.sound) {
                self.sound.stop();
            }

            self.trigger('tdplayer.stop');
            self.log('stop');

            return self;
        };

        this.next = function(autoplay) {
            self.log('next');

            // Play the next track?
            if(typeof autoplay === 'undefined') {
                self.playWhenReady = self.config.autoswitch;
            } else {
                self.playWhenReady = autoplay;
            }

            self.log(self.playWhenReady);

            if(self.config.loopTrack) {
                self.trigger('tdplayer.playlist.trackLooped');

                self.changeTrack();
            } else if(self.tracks[self.currentTrackIndex + 1]) {
                self.currentTrackIndex += 1;
                self.changeTrack();

                self.trigger('tdplayer.playlist.next', self.currentTrackIndex-1, self.currentTrackIndex);
                self.log('has next');
            } else if(self.config.loop) {
                self.currentTrackIndex = 0;
                self.changeTrack();

                self.trigger('tdplayer.playlist.looped');
                self.log('looped');
            } else {
                self.currentTrackIndex = self.tracks.length - 1;

                self.trigger('tdplayer.playlist.ended', self.config.onPlaylistFinished);
                self.log('no mas');
            }

            return self;
        };

        this.prev = function(autoplay){
            // Play the next track?
            if(typeof autoplay === 'undefined') {
                self.playWhenReady = self.config.autoswitch;
            } else {
                self.playWhenReady = autoplay;
            }

            if(self.tracks[self.currentTrackIndex - 1]) {
                self.currentTrackIndex -= 1;
                self.changeTrack();

                self.trigger('tdplayer.playlist.prev');
            } else if(self.config.loop) {
                self.currentTrackIndex = self.tracks.length - 1;
                self.changeTrack();

                self.trigger('tdplayer.playlist.looped');
            } else {
                self.currentTrackIndex = 0;
                self.trigger('tdplayer.playlist.restarted');
            }

            return self;
        };

        this.goto = function(index, autoplay){
            self.log('goto');

            // Play the next track?
            if(typeof autoplay === 'undefined') {
                self.playWhenReady = self.config.autoswitch;
            } else {
                self.playWhenReady = autoplay;
            }

            if(self.tracks[index]) {
                self.currentTrackIndex = index;

                self.trigger('tdplayer.playlist.goto');
                self.changeTrack();
            }

            return self;
        };

        // Sound related methods
        this.restartTrack = function() {
            self.position(0);
            return self;
        };

        this.mute = function() {
            if(self.sound) {
                self.sound.toggleMute();
            }

            self.trigger('tdplayer.mute', self.sound.muted);

            return self;
        };

        // Could we move to the next track?
        this.hasNext = function() {
            self.log('has next');

            if(self.tracks[self.currentTrackIndex + 1]) {
                return true;
            } else if(self.config.loop && self.tracks.length > 1) {
                return true;
            }

            return false;
        };

        // Could we move to the previous track?
        this.hasPrev = function() {
            if(self.tracks[self.currentTrackIndex - 1]) {
                return true;
            } else if(self.config.loop && self.tracks.length > 1) {
                return true;
            }

            return false;
        };


        this.getTime = function() {
            var time = this.position();
            var ms = time % 1000;
            var s = Math.floor((time / 1000) % 60);
            var m = Math.floor((time / (60 * 1000)) % 60);
            var h = Math.floor((time / (60 * 60 * 1000)) % 24);
            var t = m + ':' + self.pad(s);

            if(h > 0) {
                t = h + ':' + t;
            }

            return t;
        };

        this.position = function(pos) {
            if(self.sound) {
                if(pos || pos === 0) {
                    //limit to bounds
                    pos = Math.min(self.sound.duration, pos);
                    pos = Math.max(0, pos);

                    self.trigger('tdplayer.position', pos);

                    //setter
                    return self.sound.setPosition(pos);
                } else {
                    self.trigger('tdplayer.position', self.sound.position);

                    //getter
                    return self.sound.position;
                }
            } else {
                return 0;
            }
        };

        this.volume = function(vol) {
            if(self.sound) {
                if(vol || vol === 0) {
                    //limit to bounds
                    vol = Math.min(100, vol);
                    vol = Math.max(0, vol);

                    self.trigger('tdplayer.volume', vol);

                    //setter
                    self.config.volume = vol;
                    return self.sound.setVolume(vol);
                } else {
                    self.trigger('tdplayer.volume', self.sound.volume);

                    //getter
                    return self.sound.volume;
                }
            } else {
                return self.config.volume;
            }
        };

        // Move to a new position in the song given a click location in the
        // form of a fraction of the song length.
        this.seek = function(relative) {
            var pos = self.sound.duration * relative;
            self.position(pos);

            return self;
        };

        // Loop to the start of the playlist.
        this.loop = function(doLoop){
            if(doLoop){
                self.config.loop = doLoop;
                self.trigger('tdplayer.loop_changed', self.config.loop);
            }

            return self.config.loop;
        };

        // Lookup a track's data, either from cache or do a lookup. Takes id or url.
        this.trackInfo = function(id, cb){
            if(self.isNumeric(id)) {
                id = self.tracks[id];
            }

            return self.resolveTrack(id, cb);
        };

        // Use jquery to register events.
        this.on = function(evnt, cb){
            return $this.on(evnt, cb);
        };

        this.trigger = function(evnt){
            var args = (arguments.length > 1) ? __slice.call(arguments, 1) : [];

            return $this.trigger(evnt, args);
        };

        // Readies player for garbage collection.
        this.destroy = function(){
            if(self.sound) {
                self.sound.destruct();
            }

            self.tracks = [];
            $this.off();
            $this.remove();
            self.tracks = [];
            self.track = null;
        };

        /* ---- private methods ---- */

        self.getTrack = function() {
            return self.currentTrack;
        };

        self.getTracks = function(callback) {
            var urls = self.getPlaylist();
            var trackObjects = [];

            async.map(urls, function(url, done) {
                self.trackInfo(url, function(track) {
                    return done(null, track);
                });
            }, function(err, trackObjects) {
                if(err) {
                    return callback([]);
                } else {
                    return callback(trackObjects);
                }
            });
        };

        self.getTrackIndex = function() {
            return self.currentTrackIndex;
        };

        self.getSound = function() {
            return self.sound;
        };

        self.getPlaylist = function() {
            return self.tracks;
        };

        self.setCache = function(url, track) {
            if(self.config.cache === true) {
                self.cache[self.config.cachePrefix + url] = track;
            }
        };

        self.getCache = function(url) {
            if(self.config.cache === true) {
                return self.cache[self.config.cachePrefix + url] || null;
            }

            return null;
        };

        self.setSound = function(track) {
            var isMoz = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            var flashFallback;

            if(isMoz === true) {
                flashFallback = true;
            }

            // Store the current track object
            self.currentTrack = track;
            self.log('setSound');
            self.trigger('tdplayer.track.info_loaded', track);

            if(!track || !track.streamable) {
                return;
            }


            // Get a SC url
            var url = track.stream_url;

            if(url.indexOf('secret_token') === -1) {
                url += '?';
            } else {
                url += '&';
            }

            url += 'consumer_key=' + self.config.consumerKey;
            url = url + "&ts=" + Math.round((new Date()).getTime() / 1000);

            // Setup the SM2 sound object.
            self.sound = soundManager.createSound({
                flashVersion: 9,
                autoLoad: true,
                useHighPerformance: false,
                id: 'track_' + track.id + self.config.cachePrefix,
                multiShot: false,
                loops: 1,
                url: url,
                volume: self.config.volume,
                waitForWindowLoad: true,
                wmode: 'transparent',
                useEQData: true,
                useWaveformData: false,
                preferFlash: flashFallback,
                whileloading: function() {
                    // Only use whole number percents.
                    var percent = Math.round(this.bytesLoaded / this.bytesTotal * 100);
                    self.trigger('tdplayer.track.whileloading', percent);
                },
                whileplaying: function() {
                    eqBarValues = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

                    if(self.config.visualizer == true && this.eqData) {
                        for (var i=0;i<256;i++){
                            eqBarValues[(i/eqBarInterval)>>0] += this.eqData.left[i];
                        }
                    }

                    var reverseEqBarValues = eqBarValues.slice().reverse();
                    var fullEQ = reverseEqBarValues.concat(eqBarValues);
                    // Round to nearest 10th of a percent for performance
                    var percent = Math.round(this.position / this.duration * 100 * 10) / 10;
                    self.trigger('tdplayer.track.whileplaying', percent, fullEQ);
                },
                onplay: function() {
                    self.log('track.onplay');
                    self.trigger('tdplayer.track.played');
                },
                onresume: function() {
                    self.trigger('tdplayer.track.resumed');
                },
                onstop: function() {
                    self.trigger('tdplayer.track.stopped');
                },
                onpause: function() {
                    self.trigger('tdplayer.track.paused');
                },
                onfinish: function() {
                    self.trigger('tdplayer.track.finished', self.config.onTrackFinished);
                },
                onload: function() {
                    self.log('onload');
                    self.trigger('tdplayer.track.ready', self.config.onTrackReady);
                }
            });

            self.trigger('tdplayer.track.bindable', track, self.sound);
        };

        // Gets a SC url and goes to SC to fetch the track data.
        self.resolveTrack = function(url, cb) {
            var originalUrl = url;

            if(!url) {
                return;
            }

            url = url.replace(/https?\:\/\/(www\.)?soundcloud\.com/gi, "");

            var trackPromise = new $.Deferred();
            var cached = self.getCache(url);
            var _track;

            // allow non SC tracks (watch for bugs)
            // look for a url, but not soundcloud.com
            if(url.match(urlregex) && (url.search(/soundcloud\.com/i) === -1 || url.search('.mp3') !== -1)) {
                _track = {
                    stream_url: url,
                    id: 0,
                    permalink_url: url,
                    streamable: true,
                    duration: 0
                };

                trackPromise.resolve(_track);
            }

            // if we're caching, check cache first
            if(self.config.cache === true && cached) {
                if(cb) {
                    trackPromise.done(function() {
                        cb(cached);
                    }).resolve();
                }
            } else {
                // Define a complete condition for the promise.
                trackPromise.done(function(_track) {
                    if(cb) {
                        return cb(_track);
                    }
                });
            }

            if(trackPromise.state() !== 'resolved') {
                var datatype;
                var resolveUrl;
                var ajaxFunctionName;

                // Safari is stupid, and doesn't follow redirects with json datatype.
                if(isSafari) {
                    ajaxFunctionName = 'jsonp';
                    datatype = 'jsonp';
                    resolveUrl = scResolveUrl + url +
                        '&format=json' +
                        '&consumer_key=' + self.config.consumerKey +
                        '&callback=?';
                } else {
                    ajaxFunctionName = 'ajax';
                    datatype = 'json';
                    resolveUrl = scResolveUrl + url +
                        '&format=json' +
                        '&consumer_key=' + self.config.consumerKey;
                }

                $[ajaxFunctionName]({
                    type: 'GET',
                    datatype: datatype,
                    url: resolveUrl,
                    crossDomain: true,
                    error: function(jqXHR, textStatus, errorThrown){
                        var track = {
                            error: true,
                            errorMessage: 'We couldn\'t load that track :('
                        };

                        if(self.config.cache) {
                            self.setCache(url, track);
                        }

                        trackPromise.resolve(track);
                    },
                    success: function(_track){
                        // Three types of 'tracks': users, sets, and individual tracks.

                        if(_track.kind === 'user') {
                            self.getTracksForUser(_track, self.config.tracksPerArtist, function(tracks) {
                                self.parseTracks(originalUrl, tracks, function(tracks) {
                                    _track = tracks[0];

                                    trackPromise.resolve(_track);
                                });
                            });
                        } else if(_track.tracks && _track.tracks.length > 0) {
                            self.parseTracks(originalUrl, _track.tracks, function(tracks) {
                                _track = tracks[0];
                                trackPromise.resolve(_track);
                            });
                        } else {
                            // maybe cache the track
                            self.processTrack(_track, function(track) {
                                if(self.config.cache) {
                                    self.setCache(url, track);
                                }

                                trackPromise.resolve(track);
                            });
                        }
                    }
                });
            }

            return trackPromise;
        };

        // Gets tracks for a given user.
        self.getTracksForUser = function(user, numTracks, cb) {
            var tracksUrl = scApiUrl + 'users/' + user.id + '/tracks.json?' +
                'consumer_key=' + self.config.consumerKey;

            $.ajax({
                url: tracksUrl,
                error: function(jqXHR, textStatus, errorThrown) {
                    return cb([]);
                },
                success: function(tracks) {
                    tracks = tracks.slice(0, Math.min(numTracks, tracks.length));

                    return cb(tracks);
                }
            });
        }

        // Get the comments for a given track.
        self.getComments = function(track, cb) {
            var privatePattern = /secret_token=([\w-]+)/g;
            var match = privatePattern.exec(track.stream_url);

            var trackCommentsUrl = scApiUrl + 'tracks/' + track.id +
                '/comments.json?consumer_key=' + self.config.consumerKey;

            if(match) {
                trackCommentsUrl += '&secret_token=' + match[1];
            }

            $.ajax({
                url: trackCommentsUrl,
                error: function(jqXHR, textStatus, errorThrown) {
                    return cb([]);
                },
                success: cb
            });
        };

        // Preload the SC track info.
        self.preloadSCTracks = function(cb) {
            // Make a copy of the original tracks array, since it will be mutated
            // if one turns out to be the URL of a set or artist.
            var originalURLs = JSON.parse(JSON.stringify(self.tracks));

            async.each(originalURLs, function(url, next) {
                self.resolveTrack(url, function(resolved) {
                    next();
                });
            }, function(err) {
                if(err) {
                    self.log('Failed to preload tracks.');
                }
                
                self.trigger('tdplayer.playlist.preloaded');

                if(typeof cb === 'function') {
                    return cb();
                }
            });
        };

        // Helper function that is called on every track returned from SoundCloud.
        // Use this to modify any fields on the track.
        self.processTrack = function(track, cb) {
            // Change the artwork_url to a larger format.
            if(track.artwork_url) {
                track.artwork_url = track.artwork_url.replace('large.jpg', 't500x500.jpg');
            }

            return cb(track);
        };

        self.parseTracks = function(url, _tracks, cb) {
            var startIndex = self.tracks.indexOf(url);

            if(!_tracks || _tracks.length === 0) {
                return cb([]);
            }

            async.map(_tracks, function(track, next) {
                self.processTrack(track, function(processedTrack) {
                    // Slice out track url - begins with http://soundcloud.com/
                    var trackUrl = processedTrack.permalink_url.substring(21);

                    // Cache tracks
                    if(self.config.cache === true) {
                        self.setCache(trackUrl, processedTrack);
                    }

                    return next(null, processedTrack);
                });
            }, function(err, processedTracks) {
                if(err) {
                    console.error('Error processing tracks.');
                    console.error(err);

                    return cb([]);
                }

                // Add tracks to playlist
                self.tracks = self.tracks.slice(0, startIndex)
                    .concat(processedTracks.map(function(track) {
                        return track.permalink_url.substring(21);
                    }))
                    .concat(self.tracks.slice(startIndex + 1));
                
                return cb(processedTracks);
            });
        };

        self.addTracks = function(tracks) {
            // take a single string or array of strings
            if(typeof tracks === 'string') {
                tracks = [tracks];
            }

            if(tracks != null && tracks.length > 0) {
                // add the tracks to the tracks array
                self.tracks = self.tracks.concat(tracks);

                // preload SC data? or init
                if(self.config.preload == true) {
                    self.preloadSCTracks.call(self, self.init);
                } else {
                    self.init.call(self);
                }
            }
        };

        self.removeTracks = function(index, howMany) {
            // If the current track is in the range to be removed, move to the
            // next available track.
            if(self.getTrackIndex() >= index && self.getTrackIndex() <= (index + howMany)) {
                if(self.tracks.length > index + howMany) {
                    self.changeTrack(index + howMany);
                } else if(index > 0) {
                    self.changeTrack(index - 1);
                } else {
                    self.changeTrack(0);
                }
            }

            return self.tracks.splice(index, howMany);
        };

        self.setTracks = function(tracks) {
            // take a single string or array of strings
            if(typeof tracks === 'string') {
                tracks = [tracks];
            }

            if(tracks != null && tracks.length > 0) {
                // Set current playlist to the list of tracks.
                self.tracks = tracks;

                // preload SC data? or init
                if(self.config.preload == true) {
                    self.preloadSCTracks.call(self, self.init);
                } else {
                    self.init.call(self);
                }
            }
        };

        self.log = function() {
            if(self.config.debug && window.console) {
                console.log.apply(console, arguments);
            }
        };

        // Helper utilities
        self.isNumeric = function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };

        self.pad = function(num) {
            if(num < 10) {
                return '0' + num;
            } else {
                return '' + num;
            }
        };

        /* internal events */
        self.on('tdplayer.track.ready', function(e, cb) {
            self.log('track.onready!!!');

            if(self.playWhenReady == true) {
                self.playWhenReady = false;
                self.play();
            }

            if(typeof cb === 'function') {
                cb();
            }
        });

        self.on('tdplayer.track.finished', function(e, cb) {
            self.log('track finished');

            if(self.config.autoswitch && (self.config.loop || self.hasNext())) {
                self.log('finished and autoswitch');
                self.next().play();
            }

            if(typeof cb === 'function') {
                cb();
            }
        });

        // This shouldn't be necessary, but we want to make sure.
        self.on('tdplayer.playlist.ended', function(e, cb) {
            self.log('playlist ended');

            if(!self.config.loop) {
                self.stop();
            }

            if(typeof cb === 'function') {
                cb();
            }
        });

        // Init everything when we're sure SM2 has loaded
        soundManager.onready(function() {
            self.log('SOUNDMANAGER2 ready!!');

            // Load tracks.
            self.addTracks(tracks);
        });

        // Detect timeout for loading SM2 swf.
        soundManager.ontimeout(function() {
            self.log('SOUNDMANAGER2 TIMEDOUT!!');
        });

        //expose only the public methods
        return {
            config: this.config,
            play: this.play,
            pause: this.pause,
            resume: this.resume,
            stop: this.stop,
            next: this.next,
            prev: this.prev,
            mute: this.mute,
            getTime: this.getTime,
            volume: this.volume,
            restartTrack: this.restartTrack,
            goto: this.goto,
            position: this.position,
            seek: this.seek,
            trackInfo: this.trackInfo,
            hasNext: this.hasNext,
            hasPrev: this.hasPrev,
            on: this.on,
            addTracks: this.addTracks,
            removeTracks: this.removeTracks,
            setTracks: this.setTracks,
            trigger: this.trigger,
            track: this.getTrack,
            tracks: this.getTracks,
            trackIndex: this.getTrackIndex,
            sound: this.getSound,
            playlist: this.getPlaylist,
            destroy: this.destroy
        };
    };

    return SoundCloudPlayer;
});
