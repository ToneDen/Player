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
            onTrackError: function(err) {
                this.dispatch(events.player.audioInterface.TRACK_ERROR, {
                    error: err
                });
            },
            onTrackFinish: function(track) {
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
            onTrackResolved: function(track) {
                var payload = normalizr.normalize(track, Track);
                this.dispatch(events.player.audioInterface.TRACK_RESOLVED, payload);
            }
        },
        create: function(player) {
            player.loading = true;
            player.nowPlaying = player.tracks[0];

            var payload = normalizr.normalize(player, Player);
            this.dispatch(events.player.CREATE, payload);

            player.tracks.forEach(ToneDen.AudioInterface.resolveTrack);

            ToneDen.AudioInterface.loadTrack(player.nowPlaying, player.autoPlay);
        },
        destroy: function(player) {
        },
        track: {
            queue: function(track, position) {
            },
            seekTo: function(track, position) {
                track.sound.setPosition(position);
            },
            select: function(track) {
                ToneDen.AudioInterface.loadTrack(track, true);
                this.dispatch(events.player.track.SELECTED, normalizr.normalize(track, Track));
            },
            togglePause: function(track) {
                ToneDen.AudioInterface.togglePause(track);
            },
            unqueueIndex: function(index) {
            }
        },
        setVolume: function(level) {
        }
    }
};
