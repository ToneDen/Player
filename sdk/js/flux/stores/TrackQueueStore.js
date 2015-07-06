/**
 * Stores the global queue of tracks to be played.
 */

var _ = require('lodash');
var Fluxxor = require('fluxxor');

var events = require('../events');

var TrackQueueStore = Fluxxor.createStore({
    initialize: function() {
        this.queue = [];

        this.bindActions(
            events.player.audioInterface.TRACK_PLAY_START, this.onTrackPlayStart,
            events.player.audioInterface.TRACK_RESOLVED, this.onTrackResolved,
            events.player.track.QUEUE, this.onTrackQueue,
            events.player.track.UNQUEUE, this.onTrackUnqueue
        );
    },
    onTrackPlayStart: function(payload) {
        var trackID = payload.trackID;

        if(this.queue[0] === trackID) {
            this.queue.splice(0, 1);
        }

        this.emit('change');
    },
    onTrackQueue: function(payload) {
        var index = payload.index || this.queue.length;
        this.queue.splice(index, 0, payload.trackID);

        this.emit('change');
    },
    onTrackResolved: function(payload) {
        var trackIndex = this.queue.indexOf(payload.trackID);

        if(trackIndex !== -1) {
            this.queue.splice(trackIndex, 1, payload.result);
            this.emit('change');
        }
    },
    onTrackUnqueue: function(payload) {
        var index = payload.index;
        this.queue.splice(index, 1);

        this.emit('change');
    }
});

module.exports = TrackQueueStore;
