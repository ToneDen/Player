/**
 * Stores the global queue of tracks to be played.
 */

var Fluxxor = require('fluxxor');
var Immutable = require('immutable');

var events = require('../events');

var TrackQueueStore = Fluxxor.createStore({
    initialize: function() {
        this.defaultQueue = Immutable.List();
        this.queue = Immutable.List();

        this.bindActions(
            events.player.audioInterface.TRACK_PLAY_START, this.onTrackPlayStart,
            events.player.audioInterface.TRACK_RESOLVED, this.onTrackResolved,
            events.player.PREVIOUS_TRACK, this.onPlayerPreviousTrack,
            events.player.queue.SET_DEFAULTS, this.onSetDefaults,
            events.player.queue.QUEUE_TRACK, this.onQueueTrack,
            events.player.queue.UNQUEUE_INDEX, this.onUnqueueIndex
        );
    },
    onPlayerPreviousTrack: function(payload) {
        this.waitFor(['PlayerInstanceStore'], function(PlayerInstanceStore) {
            var playerWasPlaying = PlayerInstanceStore.instances.getIn([payload.playerID, 'nowPlaying']);
            var willPlay = PlayerInstanceStore.instances.getIn([payload.playerID, 'nextTrack']);

            if(playerWasPlaying && willPlay && playerWasPlaying !== willPlay) {
                this.defaultQueue = this.defaultQueue.unshift(playerWasPlaying);
            }
        });
    },
    onQueueTrack: function(payload) {
        var index = payload.index || this.queue.size;
        this.queue = this.queue.splice(index, 0, payload.trackID);

        this.emit('change');
    },
    onSetDefaults: function(payload) {
        this.defaultQueue = Immutable.List(payload.result);
        this.emit('change');
    },
    onTrackPlayStart: function(payload) {
        var trackID = payload.trackID;

        if(this.queue.get(0) === trackID) {
            this.queue = this.queue.splice(0, 1);
        }

        if(this.defaultQueue.get(0) === trackID) {
            this.defaultQueue = this.defaultQueue.splice(0, 1);
        }

        this.emit('change');
    },
    onTrackResolved: function(payload) {
        var queueIndex = this.queue.indexOf(payload.trackID);
        var defaultIndex = this.defaultQueue.indexOf(payload.trackID);

        if(queueIndex !== -1) {
            this.queue = Immutable.List.prototype.splice.apply(this.queue, [queueIndex, 1].concat(payload.result));
        }

        if(defaultIndex !== -1) {
            this.defaultQueue = Immutable.List.prototype.splice.apply(this.defaultQueue, [defaultIndex, 1].concat(payload.result));
        }

        if(queueIndex !== -1 || defaultIndex !== -1) {
            this.emit('change');
        }
    },
    onUnqueueIndex: function(payload) {
        var index = payload.index;
        this.queue = this.queue.splice(index, 1);

        this.emit('change');
    }
});

module.exports = TrackQueueStore;
