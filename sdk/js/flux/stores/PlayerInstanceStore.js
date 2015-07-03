/**
 * Stores state for individual player instances.
 */

var _ = require('lodash');
var Fluxxor = require('fluxxor');

var events = require('../events');

var PlayerInstanceStore = Fluxxor.createStore({
    initialize: function() {
        this.instances = {};

        this.bindActions(
            events.player.audioInterface.TRACK_FINISHED, this.onTrackFinished,
            events.player.audioInterface.TRACK_RESOLVED, this.onTrackResolved,
            events.player.CONFIG_UPDATED, this.onConfigUpdated,
            events.player.CREATE, this.onPlayerCreate,
            events.player.track.SELECTED, this.onTrackSelected
        );
    },
    getStateByID: function(id) {
        var TrackStore = this.flux.store('TrackStore');
        var instance = this.instances[id];
        var state;

        if(instance) {
            state = instance;
        } else {
            state = {
                loading: true
            };
        }

        return _.clone(state);
    },
    getNextTrackForInstance: function(instanceID) {
        var instance = this.instances[instanceID];
        var nowPlayingIndex = instance.tracks.indexOf(instance.nowPlaying);
        var nextTrack;

        if(instance.repeat) {
            nextTrack = instance.nowPlaying;
        } else if(instance.tracks[nowPlayingIndex + 1]) {
            nextTrack = instance.tracks[nowPlayingIndex + 1];
        } else {
            nextTrack = null;
        }

        return nextTrack;
    },
    onConfigUpdated: function(payload) {
        _.forIn(this.instances, function(player) {
            _.merge(player, payload.config);
        });

        this.emit('change');
    },
    onPlayerCreate: function(payload) {
        _.merge(this.instances, payload.entities.players);
        this.emit('change');
    },
    onTrackFinished: function(payload) {
        var trackID = payload.trackID;

        _.forIn(this.instances, function(player, instanceID) {
            if(player.nowPlaying === trackID) {
                player.nextTrack = this.getNextTrackForInstance(instanceID);
            }
        }.bind(this));

        this.emit('change');
    },
    onTrackResolved: function(payload) {
        var originalTrackID = payload.trackID;

        // Go through each player and replace the original track with the new array of tracks.
        _.forIn(this.instances, function(player) {
            var originalTrackIndex = player.tracks.indexOf(originalTrackID);
            if(originalTrackIndex !== -1) {
                var spliceArgs = [originalTrackIndex, 1].concat(payload.result);
                Array.prototype.splice.apply(player.tracks, spliceArgs);

                if(player.nowPlaying === originalTrackID) {
                    player.nowPlaying = payload.result[0];
                }
            }
        });

        this.emit('change');
    },
    onTrackSelected: function(payload) {
        _.forIn(this.instances, function(player) {
            if(player.tracks.indexOf(payload.result) !== -1) {
                player.nowPlaying = payload.result;
            }

            delete player.nextTrack;
        });

        this.emit('change');
    }
});

module.exports = PlayerInstanceStore;
