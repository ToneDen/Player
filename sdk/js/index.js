require('../css');

var _merge = require('lodash/object/merge');
var BatchingStrategy = require('react/lib/ReactDefaultBatchingStrategy');
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

    // Custom dispatch wrapper to prevent errors when dispatching actions in componentDidMount method:
    // https://github.com/BinaryMuse/fluxxor/pull/100
    flux.setDispatchInterceptor(function(action, dispatch) {
        BatchingStrategy.batchedUpdates(function() {
            dispatch(action);
        });
    });

    // Debug logging.
    flux.on('dispatch', function(type, payload) {
        if(doNotLogEventTypes.indexOf(type) === -1) {
            ToneDen.log(type + ' event dispatched with payload ', payload);
        }
    });
}

if(!audioInterface) {
    audioInterface = new AudioInterface(flux);
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
    player: player,
    ready: true
};

// Override default React rootID.
ReactInjection.RootIndex.injectCreateReactRootIndex(function() {
    return Math.floor(Math.random() * 10000 + 1);
});

ToneDen.ready = true;
