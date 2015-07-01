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
    onPlayerCreate: function(payload) {
        _.merge(this.instances, payload.entities.players);
        this.emit('change');
    },
    onTrackSelected: function(payload) {
        _.forIn(this.instances, function(player) {
            if(player.tracks.indexOf(payload.result) !== -1) {
                player.nowPlaying = payload.result;
            }
        });

        this.emit('change');
    }
});

module.exports = PlayerInstanceStore;
