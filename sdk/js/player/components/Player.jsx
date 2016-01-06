var Fluxxor = require('fluxxor');
var Immutable = require('immutable');
var React = require('react');

var Default = require('./themes/Default');
var Empty = require('./themes/Empty');
var Feed = require('./themes/Feed');
var Mini = require('./themes/Mini');
var Single = require('./themes/Single');
var Full = require('./themes/Full');

var helpers = require('../../helpers');

var Player = React.createClass({
    mixins: [
        Fluxxor.FluxMixin(React),
        Fluxxor.StoreWatchMixin('PlayerInstanceStore'),
        require('./mixins/PlayerControls')
    ],
    getStateFromFlux: function() {
        var PlayerInstanceStore = this.getFlux().store('PlayerInstanceStore');
        var TrackStore = this.getFlux().store('TrackStore');
        var instance = PlayerInstanceStore.getStateByID(this.props.id);

        if(!instance) {
            React.unmountComponentAtNode(this.refs.root.getDOMNode().parentElement);
            return;
        }

        var nextTrackID = instance.get('nextTrack');

        instance = instance.merge({
            nextTrack: nextTrackID === 'end' ? nextTrackID : TrackStore.getTracks(nextTrackID).get(0),
            nowPlaying: TrackStore.getTracks(instance.get('nowPlaying')).get(0),
            tracks: TrackStore.getTracks(instance.get('tracks'))
        });

        var tracks = instance.get('tracks');

        // Global instances may not have the nowPlaying track in their tracks array.
        if(instance.get('global')) {
            tracks = tracks.push(instance.get('nowPlaying'));
        }

        var loading = !tracks.every(function(track) {
            return track && (track.get('resolved') || track.get('error'));
        });

        instance = instance.set('loading', loading);

        return {
            player: instance
        };
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        return !Immutable.is(nextState.player, this.state.player) || !Immutable.is(nextProps, this.props);
    },
    componentDidMount: function() {
        if(this.props.keyboardEvents) {
            document.addEventListener('keydown', this.onKeyDown);
        }
    },
    componentDidUpdate: function(prevProps, prevState) {
        var nextTrack = this.state.player.get('nextTrack');

        // If the currently playing track has finished, the nextTrack property will be set. In that case, play it.
        if(nextTrack && !prevState.player.get('nextTrack')) {
            helpers.waitForCurrentAction.bind(this)(function() {
                var nowPlaying;

                if(nextTrack === 'end') {
                    nowPlaying = this.state.player.get('nowPlaying');

                    if(nowPlaying) {
                        this.getFlux().actions.player.track.togglePause(nowPlaying.toJS());
                    }
                } else {
                    this.getFlux().actions.player.track.select(nextTrack.toJS());
                }
            });
        }
    },
    componentWillUnmount: function() {
        if(this.props.keyboardEvents) {
            document.removeEventListener('keydown', this.onKeyDown);
        }
    },
    render: function() {
        var playerContent;
        var themeClass = '';

        if(this.state.player.get('empty')) {
            playerContent = <Empty {...this.state} />;
        } else if(this.state.player.get('single')) {
            playerContent = <Single {...this.state} />;
            themeClass = 'solo';
        } else if(this.state.player.get('mini')) {
            playerContent = <Mini {...this.state} />;
            themeClass = 'mini';
        } else if(this.state.player.get('feed')) {
            playerContent = <Feed {...this.state} />;
            themeClass = 'feed';
        } else if (this.state.player.get('full')) {
            playerContent = <Full {...this.state} />;
            themeClass = 'full';
        } else {
            playerContent = <Default {...this.state} />;
            if(this.state.player.get('shrink') && this.state.player.get('container').offsetHeight < 500) {
                themeClass = 'shrink';
            }
        }

        return (
            <div className={'td tdrow player ' + this.state.player.get('skin') + ' ' + themeClass} ref='root'>
                {playerContent}
            </div>
        );
    }
});

module.exports = Player;
