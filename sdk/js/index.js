require('../css');

var _merge = require('lodash/object/merge');
var Fluxxor = require('fluxxor');
var ReactInjection = require('react/lib/ReactInjection');

var analytics = require('./analytics');
var AudioInterface = require('./player/AudioInterface');
var constants = require('./constants');
var events = require('./flux/events');

// Record initial load event.
analytics('ToneDenTracker.send', {
    hitType: 'event',
    eventCategory: 'sdk',
    eventAction: 'loaded',
    eventLabel: window.location.href
});

var flux = ToneDen.flux;
var audioInterface = ToneDen.AudioInterface;

var doNotLogEventTypes = [
    events.player.audioInterface.TRACK_LOAD_AMOUNT_CHANGED,
    events.player.audioInterface.TRACK_PLAY_POSITION_CHANGED,
    events.player.audioInterface.TRACK_RESOLVED
];

if(!flux) {
    flux = new Fluxxor.Flux(require('./flux/stores'), require('./flux/actions'));

    // Debug logging.
    flux.on('dispatch', function(type, payload) {
        if(doNotLogEventTypes.indexOf(type) === -1) {
            ToneDen.log(type + ' event dispatched with payload ', payload);
        }
    });

    ToneDen.flux = flux;
}

if(!audioInterface) {
    audioInterface = new AudioInterface();
    ToneDen.AudioInterface = audioInterface;
}

// Global ToneDen configuration function.
function configure(parameters) {
    _merge(ToneDen.parameters, parameters);
}

function log() {
    if(ToneDen.parameters.debug) {
        console.debug.apply(console, arguments);
    }
}

var player = require('./player');

module.exports = {
    AudioInterface: audioInterface,
    configure: configure,
    flux: flux,
    log: log,
    player: player
};

// Override default React rootID.
ReactInjection.RootIndex.injectCreateReactRootIndex(function() {
    return Math.floor(Math.random() * 10000 + 1);
});
