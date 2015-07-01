var _ = require('lodash');
var async = require('async');
var request = require('superagent');
var soundManager = require('../vendor/soundManager2').soundManager;

var constants = require('../constants');

soundManager.setup({
    debugMode: false,
    forceUseGlobalHTML5Audio: true
});

var AudioInterface = function(parameters) {
    // Initialize configuration.
    var defaultParameters = {
        cache: true
    };
    this.parameters = _.merge(defaultParameters, parameters);
    this.resolveCache = {};
    this.soundCache = {};
    this.nowPlaying = null;

    var actions = ToneDen.flux.actions;
    var self = this;
    var soundcloudConsumerKey = '0e545f4886c0c8006a4f95e2036399c0';
    var soundcloudResolveURL = constants.protocol + '//api.soundcloud.com/resolve?url=http://soundcloud.com';
    var urlRegex = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);

    function createSound(track, autoPlay) {
        var sound = soundManager.createSound({
            autoLoad: true,
            autoPlay: autoPlay,
            id: track.id,
            onload: function() {
                actions.player.audioInterface.onTrackReady(this.id);
            },
            onpause: function() {
                actions.player.audioInterface.onTrackPlayingChange(this.id, false);
            },
            onplay: function() {
                if(self.nowPlaying) {
                    self.nowPlaying.pause();
                }

                self.nowPlaying = this;
                actions.player.audioInterface.onTrackPlayStart(this.id);
            },
            onresume: function() {
                actions.player.audioInterface.onTrackPlayingChange(this.id, true);
            },
            url: track.resolved.stream_url,
            whileloading: function() {
                //actions.player.audioInterface.onTrackLoadAmountChange(this.id, this.bytesLoaded);
            },
            whileplaying: function() {
                actions.player.audioInterface.onTrackPlayPositionChange(this.id, this.position);
            }
        });

        return sound;
    }

    this.loadTrack = function(track, autoPlay) {
        if(track.sound) {
            track.sound.setPosition(0);
            track.sound.play();
        }

        async.waterfall([
            function(next) {
                if(!track.resolved) {
                    return this.resolveTrack(track, next);
                } else {
                    return next(null, track);
                }
            }.bind(this),
            function(track, next) {
                if(!track.sound) {
                    track.sound = createSound(track, autoPlay);

                    delete track.playing;

                    actions.player.audioInterface.onTrackResolved(track);
                }

                return next(null, track);
            }
        ], function(err, track) {
            if(err) {
                actions.player.audioInterface.onTrackError(err);
            }
        });
    };

    this.resolveTrack = function(track, callback) {
        var url = track.url || track;

        if(self.parameters.cache && self.resolveCache[url]) {
            return callback(null, self.resolveCache[url]);
        }

        async.waterfall([
            function(next) {
                if(url.search(/soundcloud\.com/i) !== -1) {
                    url = url.replace(/https?\:\/\/(www\.)?soundcloud\.com/gi, '');

                    request.get(soundcloudResolveURL + url)
                        .query({
                            consumer_key: soundcloudConsumerKey,
                            format: 'json'
                        })
                        .end(function(err, res) {
                            if(err) {
                                return next(err);
                            } else {
                                var track = res.body;
                                track.stream_url += '?consumer_key=' + soundcloudConsumerKey;
                                return next(null, track);
                            }
                        });
                } else if(url.match(urlRegex)) {
                    return next(null, {
                        stream_url: url
                    });
                } else {
                    return next(new Error('I don\'t know how to deal with that URL.', url));
                }
            },
            function(resolvedTrack, next) {
                if(self.parameters.cache) {
                    self.resolveCache[url] = resolvedTrack;
                }

                track.resolved = resolvedTrack;
                delete track.playing;

                actions.player.audioInterface.onTrackResolved(track);

                return next(null, track);
            }
        ], callback);
    };

    this.togglePause = function(track, paused) {
        if(track.sound) {
            track.sound.togglePause();
        }
    };

    return {
        loadTrack: this.loadTrack,
        resolveTrack: this.resolveTrack,
        togglePause: this.togglePause
    };
};

module.exports = AudioInterface;
