var _merge = require('lodash/object/merge');
var _uniqueId = require('lodash/utility/uniqueId');

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var React = require('react');

var constants = require('../constants');

var Player = require('./components/Player');

function processUrlInput(url) {
    var id = _uniqueId('track_');

    if(typeof url === 'object') {
        url = {
            id: url.id || id,
            stream_id: url.stream_id,
            stream_url: url.stream_url
        };
    } else if(typeof url === 'string') {
        url = {
            id: id,
            stream_url: url
        };
    }

    url.id = String(url.id);

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

        _merge(ToneDen.AudioInterface.parameters, {
            cache: parameters.cache,
            volume: parameters.volume
        });

        // Escape first number in css selector.
        if(dom.charAt(0) === '#' && !isNaN(dom.charAt(1))) {
            dom = '#\\' + dom.charCodeAt(1).toString(16) + ' ' + dom.substring(2);
        }

        var container = document.querySelector(dom);

        var tracks = urls.map(processUrlInput);

        if(parameters.soundcloudConsumerKey || parameters.debug) {
            ToneDen.configure({
                debug: parameters.debug,
                soundcloudConsumerKey: parameters.soundcloudConsumerKey
            });
        }

        var instance = {
            destroy: function() {
                var instance = ToneDen.flux.store('PlayerInstanceStore').instances.get(parameters.id);
                var nowPlaying;

                if(instance) {
                    nowPlaying = ToneDen.flux.store('TrackStore').tracks.get(instance.get(nowPlaying));
                    ToneDen.flux.actions.player.destroy(parameters.id);
                }
            },
            update: function(newParameters) {
                if(newParameters.urls) {
                    newParameters.tracks = newParameters.urls.map(processUrlInput);
                }

                ToneDen.flux.actions.player.update(parameters.id, newParameters);
            }
        };

        // Set up default parameters.
        parameters = _merge({
            container: container,
            debug: false, // Output debug messages?
            feed: false,
            flux: ToneDen.flux,
            global: false, // Should this player show what is playing on any player in the page?
            keyboardEvents: false, // Should we listen to keyboard events?
            id: _uniqueId('player_'),
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
            React.render(PlayerFactory(parameters), container);
        } else {
            console.error('The dom component specified by "' + dom + '" does not exist.');
        }

        return instance;
    };
    this.setDefaultTracks = function(tracks, insertLocation) {
        ToneDen.flux.actions.player.queue.setDefaultTracks(tracks.map(processUrlInput), insertLocation);
    };
    this.pause = function() {
        var globalPlayer = ToneDen.flux.store('PlayerInstanceStore').getGlobalInstance();
        var track = ToneDen.flux.store('TrackStore').tracks.get(globalPlayer.get('nowPlaying')).toJS();

        if(track) {
            ToneDen.flux.actions.player.track.togglePause(track, true);
        }
    };
    this.play = function() {
        var globalPlayer = ToneDen.flux.store('PlayerInstanceStore').getGlobalInstance();
        var track = ToneDen.flux.store('TrackStore').tracks.get(globalPlayer.get('nowPlaying')).toJS();

        if(track) {
            ToneDen.flux.actions.player.track.togglePause(track, false);
        }
    };
    this.playTrack = function(url) {
        ToneDen.flux.actions.player.track.select(processUrlInput(url));
    };
    this.queueTrack = function(track, index) {
        ToneDen.flux.actions.player.queue.queueTrack(processUrlInput(track), index);
    };
    this.unqueueIndex = function(index) {
        ToneDen.actions.player.queue.unqueueIndex(index);
    };
};

inherits(ToneDenPlayer, EventEmitter);

module.exports = new ToneDenPlayer();
