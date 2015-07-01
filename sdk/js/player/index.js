var _ = require('lodash');
var $ = require('jquery');
var React = require('react');

var AudioInterface = require('./AudioInterface');
var constants = require('../constants');
//var tdPlayer = require('../vendor/td-interface');

var Player = require('./components/Player');

module.exports = {
    create: function(urls, dom, parameters) {
        ToneDen.AudioInterface = ToneDen.AudioInterface || new AudioInterface();

        if(arguments.length === 1) {
            parameters = urls;
            urls = null;
        }

        urls = urls || parameters.urls || [];
        dom = dom || parameters.dom;

        var container = $(dom);

        var tracks = urls.map(function(url) {
            var id = _.uniqueId();

            if(typeof url === 'object') {
                url.id = id;
            } else if(typeof url === 'string') {
                url = {
                    id: id,
                    url: url
                };
            }

            return url;
        });

        // Set up default parameters.
        var parameters = {
            container: container,
            debug: false, // Output debug messages?
            feed: false,
            flux: ToneDen.flux,
            keyboardEvents: false, // Should we listen to keyboard events?
            id: _.uniqueId(),
            mini: false,
            onTrackReady: null,
            onTrackFinished: null,
            onPlaylistFinished: null,
            shrink: true, // Default option to shrink player responsively if container is too small
            single: null,
            skin: 'light',
            staticUrl: constants.protocol + '//sd.toneden.io/',
            togglePause: true, // Default option to toggle pause/play when clicked
            tracksPerArtist: 10, // How many tracks to load when given an artist SoundCloud URL.
            tracks: tracks,
            useCustomPurchaseTitle: true,
            visualizerType: 'waves' // Equalizer type. 'waves' or 'bars'
        };

        var PlayerFactory = React.createFactory(Player);

        ToneDen.flux.actions.player.create(parameters);

        if(container) {
            React.render(PlayerFactory(parameters), container[0]);
        }
    }
};
