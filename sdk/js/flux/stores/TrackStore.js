/**
 * Stores all tracks that have been loaded on the page.
 */

var Fluxxor = require('fluxxor');
var Immutable = require('immutable');

var events = require('../events');

var TrackStore = Fluxxor.createStore({
    initialize: function() {
        this.tracks = Immutable.Map();

        this.bindActions(
            events.player.audioInterface.TRACK_ERROR, this.onTrackError,
            events.player.audioInterface.TRACK_FINISHED, this.onTrackFinished,
            events.player.audioInterface.TRACK_LOAD_AMOUNT_CHANGED, this.onTrackLoadAmountChanged,
            events.player.audioInterface.TRACK_PLAY_POSITION_CHANGED, this.onTrackPlayPositionChanged,
            events.player.audioInterface.TRACK_PLAYING_CHANGED, this.onTrackPlayingChanged,
            events.player.audioInterface.TRACK_PLAY_START, this.onTrackPlayStart,
            events.player.audioInterface.TRACK_READY, this.onTrackReady,
            events.player.audioInterface.TRACK_RESOLVED, this.onTrackResolved,
            events.player.audioInterface.TRACK_UPDATED, this.onTrackUpdated,
            events.player.CREATE, this.onTrackUpdated,
            events.player.track.SELECTED, this.onTrackSelected,
            events.player.track.TOGGLE_PAUSE, this.onTrackTogglePause
        );
    },
    getTracks: function(trackIDs) {
        if(typeof trackIDs === 'string' || typeof trackIDs === 'number') {
            trackIDs = [String(trackIDs)];
        } else if(trackIDs instanceof Array || trackIDs instanceof Immutable.List) {
            trackIDs = trackIDs.map(String);
        } else if(!trackIDs) {
            return Immutable.List();
        }

        trackIDs = Immutable.List(trackIDs);

        return trackIDs.map(function(id) {
            return this.tracks.get(id);
        }.bind(this)).toList();
    },
    onTrackError: function(payload) {
        this.tracks = this.tracks.mergeDeepIn([payload.trackID], {
            error: true,
            errorMessage: payload.error.message,
            loading: false,
            playing: false,
            resolved: {
                user: {}
            }
        });

        this.emit('change');
    },
    onTrackFinished: function(payload) {
        this.tracks = this.tracks.setIn([payload.trackID, 'playing'], false);
        this.tracks = this.tracks.setIn([payload.trackID, 'playbackPosition'], 0);

        ToneDen.player.emit('track.finished', this.tracks.get(payload.trackID).toJS());
        this.emit('change');
    },
    onTrackLoadAmountChanged: function(payload) {
        this.tracks = this.tracks.setIn([payload.trackID, 'loading'], true);
        this.emit('change');
    },
    onTrackPlayingChanged: function(payload) {
        this.tracks = this.tracks.setIn([payload.trackID, 'playing'], payload.isPlaying);

        if(payload.isPlaying) {
            ToneDen.player.emit('track.played', this.tracks.get(payload.trackID).toJS());
        } else {
            ToneDen.player.emit('track.paused', this.tracks.get(payload.trackID).toJS());
        }

        this.emit('change');
    },
    onTrackPlayPositionChanged: function(payload) {
        var trackID = payload.trackID;
        var currentPosition = this.tracks.getIn([trackID, 'playbackPosition']) || 0;
        var newPosition = payload.position;

        // Only fire an update if the last update occurred more than 100ms ago.
        if(Math.abs(newPosition - currentPosition) > 200) {
            this.tracks = this.tracks.setIn([trackID, 'playbackPosition'], newPosition);
            this.emit('change');
        }
    },
    onTrackPlayStart: function(payload) {
        this.tracks = this.tracks.map(function(track, id) {
            if(id === payload.trackID) {
                return track.set('playing', true);
            } else {
                return track.set('playing', false);
            }
        });

        ToneDen.player.emit('track.started', this.tracks.get(payload.trackID).toJS());

        this.emit('change');
    },
    onTrackReady: function(payload) {
        this.tracks = this.tracks.setIn([payload.trackID, 'loading'], false);
        this.emit('change');
    },
    onTrackResolved: function(payload) {
        this.tracks = this.tracks.mergeDeep(payload.entities.tracks);
        this.emit('change');
    },
    onTrackSelected: function(payload) {
        this.tracks = this.tracks.setIn([payload.result, 'loading'], true);
        this.emit('change');
    },
    onTrackTogglePause: function(payload) {
        this.tracks = this.tracks.setIn([payload.trackID, 'playing'], !this.tracks.getIn([payload.trackID, 'playing']));
        this.emit('change');
    },
    onTrackUpdated: function(payload) {
        this.tracks = this.tracks.mergeDeep(payload.entities.tracks);
        this.emit('change');
    }
});

module.exports = TrackStore;
