/**
 * Stores state for individual player instances.
 */

var Fluxxor = require('fluxxor');
var Immutable = require('immutable');

var events = require('../events');

var PlayerInstanceStore = Fluxxor.createStore({
    initialize: function() {
        this.instances = Immutable.Map();

        this.bindActions(
            events.player.audioInterface.TRACK_ERROR, this.onTrackError,
            events.player.audioInterface.TRACK_FINISHED, this.onTrackFinished,
            events.player.audioInterface.TRACK_LOAD_AMOUNT_CHANGED, this.emitChangeAfterTrackStore,
            events.player.audioInterface.TRACK_PLAY_POSITION_CHANGED, this.emitChangeAfterTrackStore,
            events.player.audioInterface.TRACK_PLAYING_CHANGED, this.emitChangeAfterTrackStore,
            events.player.audioInterface.TRACK_PLAY_START, this.onTrackPlayStart,
            events.player.audioInterface.TRACK_RESOLVED, this.onTrackResolved,
            events.player.audioInterface.TRACK_UPDATED, this.emitChangeAfterTrackStore,
            events.player.CONFIG_UPDATED, this.onConfigUpdated,
            events.player.CREATE, this.onPlayerCreate,
            events.player.DESTROY, this.onPlayerDestroy,
            events.player.track.SELECTED, this.onTrackSelected,
            events.player.track.TOGGLE_PAUSE, this.emitChangeAfterTrackStore
        );
    },
    emitChangeAfterTrackStore: function() {
        this.waitFor(['TrackStore'], function() {
            this.emit('change');
        });
    },
    getStateByID: function(id) {
        var TrackStore = this.flux.store('TrackStore');
        var instance = this.instances.get(id);
        var state;

        if(instance) {
            state = instance;
        } else {
            state = Immutable.Map({
                loading: true
            });
        }

        return state;
    },
    getNextTrackForInstance: function(instance, TrackQueueStore) {
        var instanceTracks = instance.get('tracks');
        var nowPlayingID = instance.get('nowPlaying');
        var nowPlayingIndex = instanceTracks.indexOf(nowPlayingID);
        var nextTrack;

        if(instance.get('repeat')) {
            nextTrack = nowPlayingID;
        } else if(instance.get('playFromQueue')) {
            nextTrack = TrackQueueStore.queue.get(0);
        } else if(instanceTracks.get(nowPlayingIndex + 1)) {
            nextTrack = instanceTracks.get(nowPlayingIndex + 1);
        } else {
            nextTrack = null;
        }

        return nextTrack;
    },
    onConfigUpdated: function(payload) {
        this.instances = this.instances.map(function(instance) {
            return instance.merge(payload.config);
        });

        this.emit('change');
    },
    onPlayerCreate: function(payload) {
        this.instances = this.instances.mergeDeep(payload.entities.players);
        this.emit('change');
    },
    onPlayerDestroy: function(payload) {
        var destroyedInstance = this.instances.get(payload.playerID);
        this.waitFor(['TrackStore'], function(TrackStore) {
            var nowPlaying = destroyedInstance && TrackStore.tracks.get(destroyedInstance.get('nowPlaying'));
            var isPlayingInOtherPlayer = this.instances.some(function(instance) {
                return instance.get('nowPlaying') === nowPlaying;
            });

            // Kind of anti-fluxy here.
            if(nowPlaying && nowPlaying.sound && !isPlayingInOtherPlayer) {
                //nowPlaying.sound.destroy();
            }

            this.instances.delete(payload.playerID);
            this.emit('change');
        }.bind(this));
    },
    onTrackError: function(payload) {
        this.waitFor(['TrackStore'], function() {
            this.emit('change');
        });
    },
    onTrackFinished: function(payload) {
        var trackID = payload.trackID;
        var onTrackFinishedCalled;

        this.waitFor(['TrackStore', 'TrackQueueStore'], function(TrackStore, TrackQueueStore) {
            this.instances = this.instances.map(function(player) {
                if(player.get('nowPlaying')) {
                    player = player.set('nextTrack', this.getNextTrackForInstance(player, TrackQueueStore));
                }

                return player;
            }.bind(this));

            this.emit('change');
        }.bind(this));
    },
    onTrackPlayStart: function(payload) {
        var trackID = payload.trackID;

        this.instances = this.instances.map(function(player) {
            if(player.get('global')) {
                player = player.set('nowPlaying', trackID);
            }

            return player;
        });

        this.emit('change');
    },
    onTrackResolved: function(payload) {
        var originalTrackID = payload.trackID;

        // Go through each player and replace the original track with the new array of tracks.
        this.instances = this.instances.map(function(player) {
            var playerTracks = player.get('tracks');
            var originalTrackIndex = playerTracks.indexOf(originalTrackID);

            if(playerTracks.contains(originalTrackID)) {
                var spliceArgs = [originalTrackIndex, 1].concat(payload.result);

                player = player.set('tracks', Immutable.List.prototype.splice.apply(playerTracks, spliceArgs));
            }

            if(player.get('nowPlaying') === originalTrackID) {
                player = player.set('nowPlaying', payload.result[0]);
            }

            return player;
        });

        this.waitFor(['TrackStore'], function() {
            this.emit('change');
        });
    },
    onTrackSelected: function(payload) {
        this.instances = this.instances.map(function(player) {
            if(player.get('tracks').contains(payload.result) || player.get('global')) {
                player = player.set('nowPlaying', payload.result);
            }

            player = player.delete('nextTrack');

            return player;
        });

        this.emit('change');
    }
});

module.exports = PlayerInstanceStore;
