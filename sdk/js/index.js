require('../css');

var Fluxxor = require('fluxxor');

var analytics = require('./analytics');
var constants = require('./constants');
var events = require('./flux/events');
var player = require('./player');

// Record initial load event.
analytics('ToneDenTracker.send', {
    hitType: 'event',
    eventCategory: 'sdk',
    eventAction: 'loaded',
    eventLabel: window.location.href
});

var flux = ToneDen.flux;
var doNotLogEventTypes = [
    events.player.audioInterface.TRACK_LOAD_AMOUNT_CHANGED,
    events.player.audioInterface.TRACK_PLAY_POSITION_CHANGED
];

if(!flux) {
    flux = new Fluxxor.Flux(require('./flux/stores'), require('./flux/actions'));

    // Debug logging.
    if(constants.env !== 'production') {
        flux.on('dispatch', function(type, payload) {
            if(doNotLogEventTypes.indexOf(type) === -1) {
                console.debug(type + ' event dispatched with payload ', payload);
            }
        });
    }
}

module.exports = {
    flux: flux,
    player: player
};
