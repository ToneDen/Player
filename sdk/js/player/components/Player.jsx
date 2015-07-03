var _ = require('lodash');
var Fluxxor = require('fluxxor');
var React = require('react');

var Default = require('./themes/Default');
var Empty = require('./themes/Empty');
var Feed = require('./themes/Feed');
var Mini = require('./themes/Mini');
var Single = require('./themes/Single');

var helpers = require('../../helpers');

var Player = React.createClass({
    mixins: [
        Fluxxor.StoreWatchMixin('PlayerInstanceStore', 'TrackStore'),
        require('./mixins/PlayerControls')
    ],
    getStateFromFlux: function() {
        var PlayerInstanceStore = this.getFlux().store('PlayerInstanceStore');
        var TrackStore = this.getFlux().store('TrackStore');
        var instance = PlayerInstanceStore.getStateByID(this.props.id);

        instance.nextTrack = TrackStore.getTracks(instance.nextTrack);
        instance.nowPlaying = TrackStore.getTracks(instance.nowPlaying);
        instance.tracks = TrackStore.getTracks(instance.tracks);

        // The player will appear once every track is ready to be displayed.
        instance.loading = !_.every(instance.tracks, 'resolved');

        return instance;
    },
    componentDidMount: function() {
        if(this.props.keyboardEvents) {
            document.addEventListener('keydown', this.onKeyDown);
        }
    },
    componentDidUpdate: function(prevProps, prevState) {
        // If the currently playing track has finished, the nextTrack property will be set. In that case, play it.
        if(this.state.nextTrack && !prevState.nextTrack) {
            helpers.waitForCurrentAction.bind(this)(function() {
                this.getFlux().actions.player.track.select(this.state.nextTrack);
            });
        }
    },
    componentWillUnmount: function() {
        if(this.props.keyboardEvents) {
            document.removeEventListener('keydown', this.onKeyDown);
        }
    },
    render: function() {
        var empty = !this.props.tracks ||
            !_.any(this.props.tracks);

        var playerContent;
        var themeClass = '';

        if(empty) {
            playerContent = <Empty {...this.state} />;
        } else if(this.state.single === true) {
            playerContent = <Single {...this.state} />;
            themeClass = 'solo';
        } else if(this.state.mini === true) {
            playerContent = <Mini {...this.state} />;
            themeClass = 'mini';
        } else if(this.state.feed === true) {
            playerContent = <Feed {...this.state} />;
            themeClass = 'feed';
        } else {
            playerContent = <Default {...this.state} />;

            if(this.state.shrink && this.state.container.height() < 500) {
                themeClass = 'shrink';
            }
        }

        return (
            <div className={'td tdrow player ' + this.state.skin + ' ' + themeClass}>
                {playerContent}
            </div>
        );
    }
});

module.exports = Player;
