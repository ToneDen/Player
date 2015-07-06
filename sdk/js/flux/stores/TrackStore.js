/**
 * Stores all tracks that have been loaded on the page.
 */

var _ = require('lodash');
var Fluxxor = require('fluxxor');

var events = require('../events');

var TrackStore = Fluxxor.createStore({
    initialize: function() {
        this.tracks = {};

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
            events.player.track.TOGGLE_PAUSE, this.onTrackTogglePause
        );
    },
    getTracks: function(trackIDs) {
        var returnArray = true;

        if(typeof trackIDs === 'number' || typeof trackIDs === 'string') {
            returnArray = false;
            trackIDs = [trackIDs].map(Number);
        } else if(!trackIDs) {
            return;
        }

        var tracks = trackIDs.map(function(id) {
            return _.clone(this.tracks[id]);
        }.bind(this));

        if(returnArray) {
            return tracks;
        } else {
            return tracks[0];
        }
    },
    onTrackError: function(payload) {
        this.tracks[payload.trackID].loading = false;
        this.tracks[payload.trackID].playing = false;
        this.tracks[payload.trackID].error = payload.error;

        this.emit('change');
    },
    onTrackFinished: function(payload) {
        this.tracks[payload.trackID].playing = false;
        this.emit('change');
    },
    onTrackLoadAmountChanged: function(payload) {
        this.tracks[payload.trackID].loading = true;
        this.emit('change');
    },
    onTrackPlayingChanged: function(payload) {
        this.tracks[payload.trackID].playing = payload.isPlaying;
        this.emit('change');
    },
    onTrackPlayPositionChanged: function(payload) {
        var trackID = payload.trackID;
        var currentPosition = this.tracks[trackID].playbackPosition || 0;
        var newPosition = payload.position;

        // Only fire an update if the last update occurred more than 100ms ago.
        if(Math.abs(newPosition - currentPosition) > 200) {
            this.tracks[trackID].playbackPosition = newPosition;
            this.emit('change');
        }
    },
    onTrackPlayStart: function(payload) {
        _.forIn(this.tracks, function(track, id) {
            if(track.id === payload.trackID) {
                track.playing = true;
            } else {
                track.playing = false;
            }
        });

        this.emit('change');
    },
    onTrackReady: function(payload) {
        this.tracks[payload.trackID].loading = false;
        this.emit('change');
    },
    onTrackResolved: function(payload) {
        _.merge(this.tracks, payload.entities.tracks);
        delete this.tracks[payload.trackID];

        this.emit('change');
    },
    onTrackTogglePause: function(payload) {
        var track = this.tracks[payload.trackID];
        track.playing = !track.playing;

        this.emit('change');
    },
    onTrackUpdated: function(payload) {
        _.merge(this.tracks, payload.entities.tracks);
        this.emit('change');
    }
});

module.exports = TrackStore;
