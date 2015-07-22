/**
 * Stores state for individual player instances.
 */

var Fluxxor = require('fluxxor');
var Immutable = require('immutable');

var events = require('../events');

var PlayerInstanceStore = Fluxxor.createStore({
    initialize: function() {
        this.instances = Immutable.Map();
        this.playHistory = Immutable.List();

        this.bindActions(
            events.player.audioInterface.TRACK_ERROR, this.emitChangeAfterTrackStore,
            events.player.audioInterface.TRACK_FINISHED, this.onTrackFinished,
            events.player.audioInterface.TRACK_LOAD_AMOUNT_CHANGED, this.emitChangeAfterTrackStore,
            events.player.audioInterface.TRACK_PLAY_POSITION_CHANGED, this.emitChangeAfterTrackStore,
            events.player.audioInterface.TRACK_PLAYING_CHANGED, this.emitChangeAfterTrackStore,
            events.player.audioInterface.TRACK_PLAY_START, this.onTrackPlayStart,
            events.player.audioInterface.TRACK_RESOLVED, this.onTrackResolved,
            events.player.audioInterface.TRACK_UPDATED, this.emitChangeAfterTrackStore,
            events.player.CONFIG_UPDATED, this.onConfigUpdated,
            events.player.CREATE, this.onPlayerUpdate,
            events.player.DESTROY, this.onPlayerDestroy,
            events.player.NEXT_TRACK, this.onPlayerNextTrack,
            events.player.PREVIOUS_TRACK, this.onPlayerPreviousTrack,
            events.player.track.SELECTED, this.onTrackSelected,
            events.player.track.TOGGLE_PAUSE, this.emitChangeAfterTrackStore,
            events.player.UPDATE, this.onPlayerUpdate
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
        var empty = !instance.get('nowPlaying') && !instance.getIn(['tracks', 'size']);;

        var state;

        if(instance) {
            state = instance.set('empty', empty);
        } else {
            state = Immutable.Map({
                loading: true
            });
        }

        return state;
    },
    addGlobalNowPlayingToPlayHistory: function() {
        var globalPlayer = this.instances.find(function(player) {
            return player.get('global');
        });
        var globalNowPlaying = globalPlayer && globalPlayer.get('nowPlaying');
        var lastPlayed = this.playHistory.get(this.playHistory.size - 1);

        if(globalNowPlaying && globalNowPlaying !== lastPlayed) {
            this.playHistory = this.playHistory.push(globalNowPlaying);
        }
    },
    getNextTrackForInstance: function(instance, TrackStore, TrackQueueStore, previousAttemptedTrack) {
        var instanceTracks = instance.get('tracks');
        var nowPlayingID = instance.get('nowPlaying');
        var nowPlayingIndex = instanceTracks.indexOf(nowPlayingID);
        var getFromDefaultQueue = !TrackQueueStore.queue.get(0);
        var nextTrackID;
        var nextTrack;

        if(instance.get('repeat')) {
            nextTrackID = nowPlayingID;
        } else if(instance.get('playFromQueue')) {
            if(getFromDefaultQueue) {
                nextTrackID = TrackQueueStore.defaultQueue.get(0);
            } else {
                nextTrackID = TrackQueueStore.queue.get(0)
            }
        } else if(instanceTracks.get(nowPlayingIndex + 1)) {
            nextTrackID = instanceTracks.get(nowPlayingIndex + 1);
        } else {
            nextTrackID = null;
        }

        nextTrack = TrackStore.tracks.get(nextTrackID);

        if(nextTrack && nextTrack.get('error') && previousAttemptedTrack !== nextTrack) {
            if(getFromDefaultQueue) {
                TrackQueueStore.defaultQueue = TrackQueueStore.defaultQueue.splice(0, 1);
            } else {
                TrackQueueStore.queue = TrackQueueStore.queue.splice(0, 1);
            }

            return this.getNextTrackForInstance(instance, TrackStore, TrackQueueStore, nextTrack);
        } else {
            return nextTrackID;
        }
    },
    onConfigUpdated: function(payload) {
        this.instances = this.instances.map(function(instance) {
            return instance.merge(payload.config);
        });

        this.emit('change');
    },
    onPlayerUpdate: function(payload) {
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
    onPlayerNextTrack: function(payload) {
        var player = this.instances.get(payload.playerID);

        this.addGlobalNowPlayingToPlayHistory();

        this.waitFor(['TrackStore', 'TrackQueueStore'], function(TrackStore, TrackQueueStore) {
            var nextTrack = this.getNextTrackForInstance(player, TrackStore, TrackQueueStore);
            this.instances = this.instances.setIn([payload.playerID, 'nextTrack'], nextTrack);

            this.emit('change');
        }.bind(this));
    },
    onPlayerPreviousTrack: function(payload) {
        var player = this.instances.get(payload.playerID);
        var nowPlaying = player.get('nowPlaying');
        var previousIndex = player.get('tracks').indexOf(nowPlaying) - 1;
        var nextTrack;

        this.waitFor(['TrackStore'], function() {
            if(player.get('global')) {
                nextTrack = this.playHistory.get(this.playHistory.size - 1);
                this.playHistory = this.playHistory.pop();
            } else {
                if(previousIndex < 0) {
                    nextTrack = nowPlaying;
                }

                nextTrack = this.instances.getIn([payload.playerID, 'tracks', previousIndex]);
            }

            this.instances = this.instances.setIn([payload.playerID, 'nextTrack'], nextTrack);
            this.emit('change');
        }.bind(this));
    },
    onTrackFinished: function(payload) {
        var trackID = payload.trackID;
        var onTrackFinishedCalled;

        this.addGlobalNowPlayingToPlayHistory();

        this.waitFor(['TrackStore', 'TrackQueueStore'], function(TrackStore, TrackQueueStore) {
            this.instances = this.instances.map(function(player) {
                if(player.get('nowPlaying')) {
                    player = player.set('nextTrack', this.getNextTrackForInstance(player, TrackStore, TrackQueueStore));
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
        this.waitFor(['TrackStore'], function(TrackStore) {
            var selectedTrack = TrackStore.tracks.get(payload.result);

            if(selectedTrack.get('error')) {
                ToneDen.player.emit('track.error', selectedTrack.get('errorMessage'));
                return;
            }

            this.instances = this.instances.map(function(player) {
                if(player.get('tracks').contains(payload.result) || player.get('global')) {
                    player = player.set('nowPlaying', payload.result);
                }

                player = player.delete('nextTrack');

                return player;
            });

            this.emit('change');
        });
    }
});

module.exports = PlayerInstanceStore;
