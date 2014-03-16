/**
 * Refactored from: https://github.com/kilokeith/soundcloud-soundmanager-player
 */
define(['vendor/soundmanager2', 'jquery'], function(soundManager, jQuery) {
    //object slice
    __slice = [].slice;

    // Setup soundmanager2.
    if(typeof soundManager !== 'undefined'){
        soundManager.setup({
            debugMode: false,
            url: 'swf',
            useHighPerformance: true,
            useHTML5Audio: true,
            wmode: 'transparent'
        });
    }

    /* SCPLAYER EVENTS */
    /*
        scplayer.init
        scplayer.play
        scplayer.pause
        scplayer.stop
        scplayer.mute
        scplayer.position
        scplayer.volume
        scplayer.changing_track
        scplayer.loop_changed

    */
    /* SCPLAYER PLAYLIST EVENTS */
    /*
        scplayer.playlist.next
        scplayer.playlist.looped
        scplayer.playlist.ended
        scplayer.playlist.prev
        scplayer.playlist.looped
        scplayer.playlist.restarted
        scplayer.playlist.goto
        scplayer.playlist.preloaded
    */
    /* SCPLAYER TRACK EVENTS */
    /*
        scplayer.track.info_loaded
        scplayer.track.bindable
        scplayer.track.ready
        scplayer.track.finished
        scplayer.track.whileloading
        scplayer.track.whileplaying
        scplayer.track.played
        scplayer.track.paused
        scplayer.track.resumed
        scplayer.track.stopped
    */

    //SoundCloud Player class
    //v0.9.6
    var SoundCloudPlayer = function(tracks, config){
        var defaults = {
            loop: false,
            start_on: 0,
            autoplay: false,
            autoswitch: true, //for playlists
            volume: 100,
            toggle_pause: true, //should pause act as a toggle?
            cache: true, //caches the SC track lookup. Browser should handle the audio
            preload: false, //prefetch the sc track data
            debug: false
        }
        var sc_resolve_url = "http://api.soundcloud.com/resolve?url=http://soundcloud.com";
        var urlregex = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);

        //keep ref to local scope
        var self = this;
        var $this = jQuery(this);

        //local vars
        this.tracks = [];
        this.config = jQuery.extend(defaults, config);
        this.currentTrackIndex = this.config.start_on;
        this.currentTrack = null;
        this.sound = null;

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
            self.trigger('scplayer.init');

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
                self.resolveTrack(url, self.setSound);

                self.trigger('scplayer.changing_track', i);
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

            self.trigger('scplayer.play', self.currentTrackIndex);

            return self;
        };

        this.pause = function(force){
            if(!force) {
                force = false;
            }

            if(self.sound) {
                if(self.config.toggle_pause && !force) {
                    self.sound.togglePause();
                } else {
                    self.sound.pause();
                }

                self.trigger('scplayer.pause', self.sound.paused);
            }

            return self;
        };

        this.resume = function(force){
            if(!force) {
                force = false;
            }

            if(self.sound) {
                if(self.config.toggle_pause && !force) {
                    self.sound.togglePause();
                } else {
                    self.sound.resume();
                }

                self.trigger('scplayer.pause', self.sound.paused);
            }

            return self;
        };

        this.stop = function() {
            if(self.sound) {
                self.sound.stop();
            }

            self.trigger('scplayer.stop');
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

            if(self.tracks[self.currentTrackIndex + 1]) {
                self.currentTrackIndex += 1;
                self.changeTrack();

                self.trigger('scplayer.playlist.next', self.currentTrackIndex-1, self.currentTrackIndex);
                self.log('has next');
            } else if(self.config.loop) {
                self.currentTrackIndex = 0;
                self.changeTrack();

                self.trigger('scplayer.playlist.looped');
                self.log('looped');
            } else {
                self.currentTrackIndex = self.tracks.length - 1;

                self.trigger('scplayer.playlist.ended');
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

                self.trigger('scplayer.playlist.prev');
            } else if(self.config.loop) {
                self.currentTrackIndex = self.tracks.length - 1;
                self.changeTrack();

                self.trigger('scplayer.playlist.looped');
            } else {
                self.currentTrackIndex = 0;
                self.trigger('scplayer.playlist.restarted');
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

                self.trigger('scplayer.playlist.goto');
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

            self.trigger('scplayer.mute', self.sound.muted);

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

                    self.trigger('scplayer.position', pos);

                    //setter
                    return self.sound.setPosition(pos);
                } else {
                    self.trigger('scplayer.position', self.sound.position);

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

                    self.trigger('scplayer.volume', vol);

                    //setter
                    self.config.volume = vol;
                    return self.sound.setVolume(vol);
                } else {
                    self.trigger('scplayer.volume', self.sound.volume);

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
            var pos = self.currentTrack.duration * relative;
            self.position(pos);

            return self;
        };

        // Loop to the start of the playlist.
        this.loop = function(doLoop){
            if(doLoop){
                self.config.loop = doLoop;
                self.trigger('scplayer.loop_changed', self.config.loop);
            }

            return self.config.loop;
        };

        // Lookup a track's data, either from cache or do a lookup. Takes id or url.
        this.trackInfo = function(id){
            if(self.isNumeric(id)) {
                id = self.tracks[id];
            }

            return self.resolveTrack(id);
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
            self.tracks = null;
            self.track = null;
            self = null;
            delete self.tracks;
            delete self.track;
        };

        /* ---- private methods ---- */

        self.getTrack = function() {
            return self.currentTrack;
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
                self.cache[url] = track;
            }
        };

        self.getCache = function(url) {
            if(self.config.cache === true) {
                return self.cache[url] || null;
            }

            return null;
        };

        self.setSound = function(track) {
            self.log('setSound');
            self.trigger('scplayer.track.info_loaded', track);

            // Store the current track object
            self.currentTrack = track;

            // Get a SC url
            var url = track.stream_url;

            if(url.indexOf('secret_token') === -1) {
                url += '?';
            } else {
                url += '&';
            }

            url += 'consumer_key=' + self.config.consumerKey;

            // Setup the SM2 sound object.
            self.sound = soundManager.createSound({
                autoLoad: true,
                id: 'track_' + track.id,
                multiShot: false,
                loops: 1,
                url: url,
                volume: self.config.volume,
                whileloading: function() {
                    // Only use whole number percents.
                    var percent = Math.round(this.bytesLoaded / this.bytesTotal * 100);
                    self.trigger('scplayer.track.whileloading', percent);
                },
                whileplaying: function() {
                    // Round to nearest 10th of a percent for performance
                    var percent = Math.round(this.position / track.duration * 100 * 10) / 10;
                    self.trigger('scplayer.track.whileplaying', percent);
                },
                onplay: function() {
                    self.log('track.onplay');
                    self.trigger('scplayer.track.played');
                },
                onresume: function() {
                    self.trigger('scplayer.track.resumed');
                },
                onstop: function() {
                    self.trigger('scplayer.track.stopped');
                },
                onpause: function() {
                    self.trigger('scplayer.track.paused');
                },
                onfinish: function() {
                    self.trigger('scplayer.track.finished');
                },
                onload: function() {
                    self.log('onload');
                    self.trigger('scplayer.track.ready', self.currentTrackIndex, self.currentTrack);
                }
            });

            self.trigger('scplayer.track.bindable', track, self.sound);
        };

        // Gets a SC url and goes to SC to fetch the track data.
        self.resolveTrack = function(url, cb) {
            var promise = new jQuery.Deferred();

            // allow non SC tracks (watch for bugs)
            // look for a url, but not soundcloud.com
            if(url.match(urlregex) && url.search(/soundcloud\.com/i) === -1) {
                var _track = {
                    stream_url:url,
                    id:0,
                    permalink_url:url,
                    duration:0
                };

                promise.resolve(_track);
            }

            // trim url
            url = url.replace(/https?\:\/\/soundcloud\.com/gi, "");

            // if we're caching, check cache first
            if(self.config.cache === true ) {
                var track = self.getCache(url);

                if(track && cb) {
                    promise.done(function() {
                        cb(track);
                    }).resolve();

                    return promise;
                }
            }

            // Define a complete condition for the promise.
            promise.done(function(_track) {
                if(_track.tracks && _track.tracks.length > 0) {
                    var tracks = self.parseTracks(url, _track.tracks);
                    _track = tracks[0];
                } else {
                    // maybe cache the track
                    if(self.config.cache === true) {
                        self.setCache(url, _track);
                    }
                }

                if(cb) {
                    cb(_track);
                }
            });

            // Call the ajax
            jQuery.ajax({
                url: sc_resolve_url + url +
                    '&format=json' +
                    '&consumer_key=' +self.config.consumerKey +
                    '&callback=?',
                dataType: 'jsonp',
                error: function(jqXHR, textStatus, errorThrown){
                    promise.reject(jqXHR, textStatus, errorThrown);
                },
                success: function(_track){
                    promise.resolve(_track);
                }
            });

            return promise;
        };

        // Preload the SC track info.
        self.preloadSCTracks = function(cb) {
            var promises = [];

            for(var x = 0, l = self.tracks.length; x < l; x++) {
                var _track = self.tracks[x];
                var promise = self.resolveTrack(_track);

                promises.push(promise);
            }

            // Have to do apply to pass many promises as list instead of array.
            jQuery.when.apply(jQuery, promises).then(function() {
                self.trigger('scplayer.playlist.preloaded');

                if(cb) {
                    cb();
                }
            }, function() {
                self.log('promises failed to preload tracks');
            });
        };

        self.parseTracks = function(url, _tracks) {
            var set_tracks = [];
            var track_urls = [];
            var start_index = self.tracks.indexOf(url);

            for(var x = 0, l = _tracks.length; x < l; x++) {
                var _track = _tracks[x];

                // Slice out track url - begins with http://soundcloud.com/
                var trackurl = _track.permalink_url.substring(21);

                // Cache tracks
                if(self.config.cache === true) {
                    self.setCache(trackurl, _track);
                }

                set_tracks.push(_track);
                track_urls.push(trackurl);
            }

            // Splice at start_index, delete 1, splice in expanded tracks.
            var args = [start_index, 1].concat(track_urls);

            // Add tracks to playlist
            self.tracks.splice.apply(self.tracks, args);

            return set_tracks;
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
        self.on('scplayer.track.ready', function(e) {
            self.log('track.onready!!!');

            if(self.playWhenReady == true) {
                self.play();
                self.playWhenReady = false;
            }
        });

        self.on('scplayer.track.finished', function(e) {
            self.log('track finished');

            if(self.config.autoswitch && (self.config.loop || self.hasNext())) {
                self.log('finished and autoswitch');

                self.next().play();
            }
        });

        // This shouldn't be necessary, but we want to make sure.
        self.on('scplayer.playlist.ended', function(e) {
            self.log('playlist ended');

            if(!self.config.loop) {
                self.stop();
            }
        });

        //init everything when we're sure SM2 has loaded
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
            trigger: this.trigger,
            track: this.getTrack,
            trackIndex: this.getTrackIndex,
            sound: this.getSound,
            playlist: this.getPlaylist,
            destroy: this.destroy,
            addTracks: this.addTracks
        };
    };

    return SoundCloudPlayer;
});
