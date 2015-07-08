var _clone = require('lodash/lang/clone');
var _merge = require('lodash/object/merge');
var _uniqueId = require('lodash/utility/uniqueId');

var async = require('async');
var soundManager = require('../vendor/soundManager2').soundManager;

var constants = require('../constants');
var soundcloud = require('./network/soundcloud');

soundManager.setup({
    debugMode: false,
    forceUseGlobalHTML5Audio: true
});

var AudioInterface = function(parameters) {
    // Initialize configuration.
    var defaultParameters = {
        cache: true,
        volume: 100
    };
    this.parameters = _merge(defaultParameters, parameters);
    this.resolveCache = {};
    this.soundCache = {};
    this.nowPlaying = null;

    var actions = ToneDen.flux.actions;
    var self = this;
    var urlRegex = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);

    function createSound(track, autoPlay) {
        var sound = soundManager.createSound({
            autoLoad: true,
            autoPlay: autoPlay,
            id: track.id,
            onfinish: function() {
                actions.player.audioInterface.onTrackFinish(this.id);
            },
            onload: function() {
                actions.player.audioInterface.onTrackReady(this.id);
            },
            onpause: function() {
                actions.player.audioInterface.onTrackPlayingChange(this.id, false);
            },
            onplay: function() {
                self.nowPlaying = this;
                actions.player.audioInterface.onTrackPlayStart(this.id);
            },
            onresume: function() {
                actions.player.audioInterface.onTrackPlayingChange(this.id, true);
            },
            url: track.resolved.stream_url,
            volume: self.parameters.volume,
            whileloading: function() {
                //actions.player.audioInterface.onTrackLoadAmountChange(this.id, this.bytesLoaded);
            },
            whileplaying: function() {
                actions.player.audioInterface.onTrackPlayPositionChange(this.id, this.position);
            }
        });

        return sound;
    }

    this.loadTrack = function(track, autoPlay, callback) {
        if(track.sound) {
            this.seekTrack(track, 0);
            track.sound.setVolume(self.parameters.volume);

            if(autoPlay && (track.sound.paused || track.sound.playState === 0)) {
                track.sound.play();
            }
        }

        async.waterfall([
            function(next) {
                if(!track.resolved) {
                    return this.resolveTrack(track, next);
                } else {
                    return next(null, [track]);
                }
            }.bind(this),
            function(tracks, next) {
                var trackToPlay = tracks[0];

                if(!trackToPlay.sound) {
                    trackToPlay.sound = createSound(trackToPlay, autoPlay);

                    async.nextTick(function() {
                        actions.player.audioInterface.onTrackSoundAdded(trackToPlay);
                    });
                }

                return next(null, trackToPlay);
            }
        ], function(err, trackToPlay) {
            if(err) {
                actions.player.audioInterface.onTrackError(trackToPlay.id, err);
            }

            if(typeof callback === 'function') {
                return callback(err);
            }
        });
    };

    this.resolveTrack = function(originalTrack, tracksPerArtist, callback) {
        var url = originalTrack.stream_url || originalTrack;

        if(typeof tracksPerArtist === 'function') {
            callback = tracksPerArtist;
            tracksPerArtist = 10;
        }

        if(self.parameters.cache && self.resolveCache[url]) {
            return async.nextTick(function() {
                return actions.player.audioInterface.onTrackResolved(originalTrack.id, self.resolveCache[url]);
            });
        }

        async.waterfall([
            function(next) {
                if(url.search(/soundcloud\.com/i) !== -1) {
                    return soundcloud.resolve(url, tracksPerArtist, next);
                } else if(url.match(urlRegex)) {
                    return next(null, {
                        stream_url: url
                    });
                } else {
                    return next(new Error('I don\'t know how to deal with that URL.', url));
                }
            },
            function(resolvedTracks, next) {
                // Since the single original track object may resolve into multiple tracks (in the case of a user or set
                // URL), we have to turn that original track into an array of new ones with new IDs.
                resolvedTracks = resolvedTracks.map(function(resolvedTrack, index) {
                    var track = _clone(originalTrack);
                    var randomID = _uniqueId('track_');

                    if(index === 0) {
                        track.id = originalTrack.id || randomID;
                    } else {
                        track.id = randomID;
                    }

                    track.id = String(track.id);
                    track.resolved = resolvedTrack;
                    delete track.playing;

                    return track;
                });

                if(self.parameters.cache) {
                    self.resolveCache[url] = resolvedTracks;
                }

                actions.player.audioInterface.onTrackResolved(originalTrack.id, resolvedTracks);

                return next(null, resolvedTracks);
            }
        ], function(err, result) {
            if(err) {
                if(err.status === 404) {
                    err = {
                        message: 'We couldn\'t find this track.'
                    };
                } else {
                    err = {
                        message: err.message
                    };
                }

                actions.player.audioInterface.onTrackError(originalTrack.id, err);
            }

            if(typeof callback === 'function') {
                return callback(err, result);
            }
        });
    };

    this.seekTrack = function(track, position) {
        async.waterfall([
            function(next) {
                if(!track.sound) {
                    return this.loadTrack(track, true, next);
                } else {
                    return next();
                }
            }.bind(this)
        ], function(err) {
            if(err) {
                return;
            }

            track.sound.setPosition(position);
            track.sound.options.position = position;
            actions.player.audioInterface.onTrackPlayPositionChange(track.id, position);

            if(track.sound.paused || track.sound.playState === 0) {
                track.sound.play();
            }
        });
    };

    this.setVolume = function(level) {
        self.parameters.volume = level;

        if(self.nowPlaying) {
            self.nowPlaying.setVolume(level);
        }
    };

    this.togglePause = function(track, paused) {
        // Prevent soundManager from resetting the track's position.
        var currentPosition;

        if(track.sound) {
            currentPosition = track.sound.position;
            track.sound.togglePause();
            track.sound.setPosition(currentPosition);
        } else {
            this.loadTrack(track, true);
        }
    };

    return {
        loadTrack: this.loadTrack,
        resolveTrack: this.resolveTrack,
        seekTrack: this.seekTrack,
        setVolume: this.setVolume,
        togglePause: this.togglePause
    };
};

module.exports = AudioInterface;
