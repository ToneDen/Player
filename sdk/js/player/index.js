var _ = require('lodash');
var $ = require('jquery');
var React = require('react');

var AudioInterface = require('./AudioInterface');
var constants = require('../constants');

var Player = require('./components/Player');

function processUrlInput(url) {
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
}

module.exports = {
    create: function(urls, dom, parameters) {
        if(arguments.length === 1) {
            parameters = urls;
            urls = null;
        }

        urls = urls || parameters.urls || [];
        dom = dom || parameters.dom;

        ToneDen.AudioInterface = ToneDen.AudioInterface || new AudioInterface({
            cache: parameters.cache,
            volume: parameters.volume
        });

        var container = $(dom);

        var tracks = urls.map(processUrlInput);

        if(parameters.soundcloudConsumerKey || parameters.debug) {
            ToneDen.configure({
                debug: parameters.debug,
                soundcloudConsumerKey: parameters.soundcloudConsumerKey
            });
        }

        // Set up default parameters.
        parameters = _.merge({
            container: container,
            debug: false, // Output debug messages?
            feed: false,
            flux: ToneDen.flux,
            global: false, // Should this player show what is playing on any player in the page?
            keyboardEvents: false, // Should we listen to keyboard events?
            id: _.uniqueId(),
            mini: false,
            onTrackReady: null,
            onTrackFinished: null,
            onPlaylistFinished: null,
            playFromQueue: false,
            repeat: false,
            shrink: true, // Default option to shrink player responsively if container is too small
            single: null,
            skin: 'light',
            staticUrl: constants.protocol + '//sd.toneden.io/',
            togglePause: true, // Default option to toggle pause/play when clicked
            tracksPerArtist: 10, // How many tracks to load when given an artist SoundCloud URL.
            tracks: tracks,
            useCustomPurchaseTitle: true,
            visualizerType: 'waves', // Equalizer type. 'waves' or 'bars'
            volume: 100
        }, parameters);

        var PlayerFactory = React.createFactory(Player);

        ToneDen.flux.actions.player.create(parameters);

        if(container) {
            React.render(PlayerFactory(parameters), container[0]);
        }

        return {
            destroy: function() {
                var instance = ToneDen.flux.store('PlayerInstanceStore').instances[parameters.id];
                var nowPlaying;

                if(instance) {
                    nowPlaying = ToneDen.flux.store('TrackStore').tracks[instance.nowPlaying];
                    ToneDen.flux.actions.player.destroy(instance);
                }
            },
            getSound: function() {
                var instance = ToneDen.flux.store('PlayerInstanceStore').instances[parameters.id];
                var nowPlaying = instance && ToneDen.flux.store('TrackStore').tracks[instance.nowPlaying];

                return nowPlaying && nowPlaying.sound;
            }
        };
    },
    queueTrack: function(track, index) {
        ToneDen.flux.actions.player.track.queue(processUrlInput(track), index);
    },
    unqueueIndex: function(index) {
        ToneDen.actions.player.track.unqueueIndex(index);
    }
};
