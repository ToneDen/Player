var analytics = require('./analytics');
var player = require('./player');

ToneDen.ready = true;

// Record initial load event.
analytics('ToneDenTracker.send', {
    hitType: 'event',
    eventCategory: 'sdk',
    eventAction: 'loaded',
    eventLabel: window.location.href
});

module.exports = {
    player: player
};
