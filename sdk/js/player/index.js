var _ = require('lodash');
var $ = require('jquery');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var React = require('react');

var AudioInterface = require('./AudioInterface');
var constants = require('../constants');

var Player = require('./components/Player');

function processUrlInput(url) {
    var id = _.uniqueId('track_');

    if(typeof url === 'object') {
        url = {
            id: url.id || id,
            stream_url: url.stream_url
        };
    } else if(typeof url === 'string') {
        url = {
            id: id,
            stream_url: url
        };
    }

    return url;
}

function ToneDenPlayer() {
    EventEmitter.call(this);

    this.create = function(urls, dom, parameters) {
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

        var instance = {
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

        // Set up default parameters.
        parameters = _.merge({
            container: container,
            debug: false, // Output debug messages?
            feed: false,
            flux: ToneDen.flux,
            global: false, // Should this player show what is playing on any player in the page?
            keyboardEvents: false, // Should we listen to keyboard events?
            id: _.uniqueId('player_'),
            instance: instance,
            mini: false,
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
    };
    this.queueTrack = function(track, index) {
        ToneDen.flux.actions.player.track.queue(processUrlInput(track), index);
    };
    this.unqueueIndex = function(index) {
        ToneDen.actions.player.track.unqueueIndex(index);
    };
};

inherits(ToneDenPlayer, EventEmitter);

module.exports = new ToneDenPlayer();
