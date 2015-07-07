var normalizr = require('normalizr');

// Define schema for nested items in actions.
var Player = new normalizr.Schema('players');
var Track = new normalizr.Schema('tracks');

Player.define({
    nowPlaying: Track,
    tracks: normalizr.arrayOf(Track)
});

var events = require('./events');

module.exports = {
    player: {
        audioInterface: {
            onTrackError: function(trackID, err) {
                this.dispatch(events.player.audioInterface.TRACK_ERROR, {
                    error: err,
                    trackID: trackID
                });
            },
            onTrackFinish: function(trackID) {
                this.dispatch(events.player.audioInterface.TRACK_FINISHED, {
                    trackID: trackID
                });
            },
            onTrackLoadAmountChange: function(trackID, bytesLoaded) {
                this.dispatch(events.player.audioInterface.TRACK_LOAD_AMOUNT_CHANGED, {
                    bytesLoaded: bytesLoaded,
                    trackID: trackID
                });
            },
            onTrackPlayingChange: function(trackID, isPlaying) {
                this.dispatch(events.player.audioInterface.TRACK_PLAYING_CHANGED, {
                    isPlaying: isPlaying,
                    trackID: trackID
                });
            },
            onTrackPlayPositionChange: function(trackID, position) {
                this.dispatch(events.player.audioInterface.TRACK_PLAY_POSITION_CHANGED, {
                    position: position,
                    trackID: trackID
                });
            },
            onTrackPlayStart: function(trackID) {
                this.dispatch(events.player.audioInterface.TRACK_PLAY_START, {
                    trackID: trackID
                });
            },
            onTrackReady: function(trackID) {
                this.dispatch(events.player.audioInterface.TRACK_READY, {
                    trackID: trackID
                });
            },
            onTrackResolved: function(trackID, tracks) {
                var payload = normalizr.normalize(tracks, normalizr.arrayOf(Track));
                payload.trackID = trackID;

                this.dispatch(events.player.audioInterface.TRACK_RESOLVED, payload);
            },
            onTrackSoundAdded: function(track) {
                // The track may or may not be playing, so don't change its play state in the store.
                delete track.playing;

                var payload = normalizr.normalize(track, Track);
                this.dispatch(events.player.audioInterface.TRACK_UPDATED, payload);
            }
        },
        create: function(player) {
            player.loading = true;
            player.nowPlaying = player.tracks[0];

            var payload = normalizr.normalize(player, Player);
            this.dispatch(events.player.CREATE, payload);

            player.tracks.forEach(function(track) {
                ToneDen.AudioInterface.resolveTrack(track, player.tracksPerArtist);
            });
        },
        destroy: function(player) {
            this.dispatch(events.player.DESTROY, {
                playerID: player.id
            });
        },
        track: {
            queue: function(track, index) {
                ToneDen.AudioInterface.resolveTrack(track);

                this.dispatch(events.player.track.QUEUE, {
                    index: index,
                    trackID: track.id
                });
            },
            seekTo: function(track, position) {
                ToneDen.AudioInterface.seekTrack(track, position);
            },
            select: function(track) {
                ToneDen.AudioInterface.loadTrack(track, true);
                this.dispatch(events.player.track.SELECTED, normalizr.normalize(track, Track));
            },
            togglePause: function(track) {
                ToneDen.AudioInterface.togglePause(track);
            },
            unqueueIndex: function(index) {
                this.dispatch(events.player.track.UNQUEUE, {
                    index: index
                });
            }
        },
        setRepeat: function(repeat) {
            repeat = repeat || false;
            this.dispatch(events.player.CONFIG_UPDATED, {
                config: {
                    repeat: repeat
                }
            });
        },
        setVolume: function(level) {
            ToneDen.AudioInterface.setVolume(level);
            this.dispatch(events.player.CONFIG_UPDATED, {
                config: {
                    volume: level
                }
            });
        }
    }
};
