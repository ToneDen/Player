var _find = require('lodash/collection/find');
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
            stream_secret: url.stream_secret,
            stream_url: url.stream_url,
            title: url.title,
            user: url.user
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

function escapeDomSelector(dom) {
    // Escape first number in css selector.
    if(dom.charAt(0) === '#' && !isNaN(dom.charAt(1))) {
        dom = '#\\' + dom.charCodeAt(1).toString(16) + ' ' + dom.substring(2);
    }

    return dom;
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

        var dom = escapeDomSelector(dom);
        var container = document.querySelector(dom);
        var tracks = urls.map(processUrlInput);

        if(parameters.soundcloudConsumerKey || parameters.debug) {
            ToneDen.configure({
                debug: parameters.debug,
                soundcloudConsumerKey: parameters.soundcloudConsumerKey
            });
        }

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

        var instance = {
            id: parameters.id,
            destroy: function() {
                var instance = ToneDen.flux.store('PlayerInstanceStore').instances.get(parameters.id);
                var nowPlaying;

                if(instance) {
                    nowPlaying = ToneDen.flux.store('TrackStore').tracks.get(instance.get('nowPlaying'));
                    ToneDen.flux.actions.player.destroy(parameters.id);
                }
            },
            next: function() {
                ToneDen.flux.actions.player.nextTrack(parameters.id);
            },
            prev: function() {
                ToneDen.flux.actions.player.previousTrack(parameters.id);
            },
            skipTo: function(index) {
                var instance = ToneDen.flux.store('PlayerInstanceStore').instances.get(parameters.id);
                var trackID = instance.getIn(['tracks', index]);
                var track = trackID && ToneDen.flux.store('TrackStore').tracks.get(trackID);

                if(track) {
                    ToneDen.flux.actions.player.track.select(track.toJS());
                }
            },
            togglePause: function(paused) {
                var instance = ToneDen.flux.store('PlayerInstanceStore').instances.get(parameters.id);
                var nowPlaying = ToneDen.flux.store('TrackStore').tracks.get(instance.get('nowPlaying'));

                if(nowPlaying) {
                    ToneDen.flux.actions.player.track.togglePause(nowPlaying.toJS(), paused);
                }
            },
            update: function(newParameters) {
                if(newParameters.urls) {
                    newParameters.tracks = newParameters.urls.map(processUrlInput);
                }

                ToneDen.flux.actions.player.update(parameters.id, newParameters);
            }
        };

        var PlayerFactory = React.createFactory(Player);

        ToneDen.flux.actions.player.create(parameters);

        ToneDen.player.instances = ToneDen.player.instances || [];
        ToneDen.player.instances.push(instance);

        if(container) {
            React.render(PlayerFactory(parameters), container);
        } else {
            console.error('The dom component specified by "' + dom + '" does not exist.');
        }

        return instance;
    };
    this.getInstanceByDom = function(dom) {
        dom = escapeDomSelector(dom);

        var PlayerInstanceStore = ToneDen.flux.store('PlayerInstanceStore');
        var domElements = document.querySelectorAll(dom);

        var instance = PlayerInstanceStore.instances.find(function(testInstance) {
            var instanceContainer = testInstance.get('container');
            var containerIndex = Array.prototype.indexOf.call(domElements, instanceContainer);
            return containerIndex !== -1;
        });

        if(instance) {
            return _find(ToneDen.player.instances, {
                id: instance.get('id')
            });
        } else {
            return null;
        }
    };
    /**
     * Functions that act on the global player instance.
     */
    this.global = {
        nowPlaying: function() {
            var globalPlayer = ToneDen.flux.store('PlayerInstanceStore').getGlobalInstance();
            var track;

            if(globalPlayer) {
                track = ToneDen.flux.store('TrackStore').tracks.get(globalPlayer.get('nowPlaying'));

                if(track) {
                    track = track.toJS();
                    track.id = Number(track.id);

                    return track;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        /**
         * Loads and plays a track in the global player.
         */
        playTrack: function(url) {
            ToneDen.flux.actions.player.track.select(processUrlInput(url));
        },
        /**
         * Adds a single track to the global player's queue.
         */
        queueTrack: function(track, index) {
            ToneDen.flux.actions.player.queue.queueTrack(processUrlInput(track), index);
        },
        /**
         * Sets the default list of tracks to be played if the global player's queue runs out of tracks.
         */
        setDefaultTracks: function(tracks, insertLocation) {
            ToneDen.flux.actions.player.queue.setDefaultTracks(tracks.map(processUrlInput), insertLocation);
        },
        /**
         * Sets the play state of the global player.
         */
        togglePause: function(paused) {
            var track = this.nowPlaying();
            if(track) {
                ToneDen.flux.actions.player.track.togglePause(track, paused);
            }
        },
        /**
         * Removes a track from the queue at the specified index.
         */
        unqueueIndex: function(index) {
            ToneDen.actions.player.queue.unqueueIndex(index);
        }
    };
    /**
     * Set whether or not the player should repeat the song it is playing.
     */
    this.setRepeat = function(repeat) {
        ToneDen.flux.actions.player.setRepeat(!!repeat);
    };
    /**
     * Set the volume level (between 0 and 100) on all audio.
     */
    this.setVolume = function(level) {
        if(level < 0 || level > 100) {
            console.error('Volume level must be between 0 and 100!');
            return;
        }

        ToneDen.flux.actions.player.setVolume(level);
    };
};

inherits(ToneDenPlayer, EventEmitter);

module.exports = new ToneDenPlayer();
