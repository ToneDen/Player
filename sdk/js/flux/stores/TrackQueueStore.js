/**
 * Stores the global queue of tracks to be played.
 */

var Fluxxor = require('fluxxor');
var Immutable = require('immutable');

var events = require('../events');

var TrackQueueStore = Fluxxor.createStore({
    initialize: function() {
        this.queue = Immutable.List();

        this.bindActions(
            events.player.audioInterface.TRACK_PLAY_START, this.onTrackPlayStart,
            events.player.audioInterface.TRACK_RESOLVED, this.onTrackResolved,
            events.player.track.QUEUE, this.onTrackQueue,
            events.player.track.UNQUEUE, this.onTrackUnqueue
        );
    },
    onTrackPlayStart: function(payload) {
        var trackID = payload.trackID;

        if(this.queue.get(0) === trackID) {
            this.queue = this.queue.splice(0, 1);
        }

        this.emit('change');
    },
    onTrackQueue: function(payload) {
        var index = payload.index || this.queue.size;
        this.queue = this.queue.splice(index, 0, payload.trackID);

        this.emit('change');
    },
    onTrackResolved: function(payload) {
        if(this.queue.contains(payload.trackID)) {
            this.queue = this.queue.splice(trackIndex, 1, payload.result);
            this.emit('change');
        }
    },
    onTrackUnqueue: function(payload) {
        var index = payload.index;
        this.queue = this.queue.splice(index, 1);

        this.emit('change');
    }
});

module.exports = TrackQueueStore;
