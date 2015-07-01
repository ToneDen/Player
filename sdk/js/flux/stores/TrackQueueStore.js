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
            events.player.audioInterface.TRACK_PLAY_START, this.onTrackPlayStart
        );
    },
    onTrackPlayStart: function(payload) {
        var trackID = payload.trackID;

        if(this.queue[0] === trackID) {
            this.queue.splice(0, 1);
        }

        this.emit('change');
    }
});

module.exports = TrackQueueStore;
