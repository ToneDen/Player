var _ = require('lodash');
var Fluxxor = require('fluxxor');
var React = require('react');

var Default = require('./themes/Default');
var Empty = require('./themes/Empty');
var Feed = require('./themes/Feed');
var Mini = require('./themes/Mini');
var Single = require('./themes/Single');

var Player = React.createClass({
    mixins: [
        Fluxxor.FluxMixin(React),
        Fluxxor.StoreWatchMixin('PlayerInstanceStore', 'TrackStore')
    ],
    getStateFromFlux: function() {
        var PlayerInstanceStore = this.getFlux().store('PlayerInstanceStore');
        var TrackStore = this.getFlux().store('TrackStore');
        var instance = PlayerInstanceStore.getStateByID(this.props.id);

        instance.nowPlaying = TrackStore.getTracks(instance.nowPlaying);
        instance.tracks = TrackStore.getTracks(instance.tracks);

        // The player will appear once every track is ready to be displayed.
        instance.loading = !_.every(instance.tracks, 'resolved');

        return instance;
    },
    render: function() {
        var empty = !this.props.tracks ||
            !_.any(this.props.tracks);

        var playerContent;

        if(empty) {
            playerContent = <Empty {...this.state} />;
        } else if(this.props.single === true) {
            playerContent = <Single {...this.state} />;
        } else if(this.props.mini === true) {
            playerContent = <Mini {...this.state} />;
        } else if(this.props.feed === true) {
            playerContent = <Feed {...this.state} />;
        } else {
            playerContent = <Default {...this.state} />;
        }

        return (
            <div className={'td tdrow player ' + this.props.skin}>
                {playerContent}
            </div>
        );
    }
});

module.exports = Player;
