var Fluxxor = require('fluxxor');
var React = require('react');

var Columns = require('../../Columns');
var Row = require('../../Row');

var helpers = require('../../../../helpers');

var Playlist = React.createClass({
    mixins: [
        Fluxxor.FluxMixin(React)
    ],
    onTrackClick: function(track) {
        this.getFlux().actions.player.track.select(track);
    },
    render: function() {
        var player = this.props.player.toJS();
        var nowPlaying = player.nowPlaying;

        var playlist = player.tracks.map(function(track, index) {
            return (
                <tr
                    className={track.playing ? 'playing' : 'track-info'}
                    key={track.id}
                    onClick={this.onTrackClick.bind(null, track)}
                >
                    {track.id === nowPlaying.id && (
                        <td width='20'>
                            <i className='tdicon-play-circle-fill current-play-icon' />
                        </td>
                    )}
                    {track.id !== nowPlaying.id && (
                        <td>
                            <div className='track-info' />
                        </td>
                    )}
                    <td>
                        <Columns className='track-info-name'>
                            {track.resolved.title}
                        </Columns>
                    </td>
                    <td
                        className='track-info-stats'
                        style={{width: '40%', display: player.container.offsetWidth < 500 ? 'none' : ''}}
                    >
                        <Columns className='track-info-social'>
                            <Columns large={4} className='track-info-plays'>
                                <i className='tdicon-play-circle-fill playlist-social-icon' />
                                {helpers.numberToCommaString(track.resolved.playback_count)}
                            </Columns>
                            <Columns large={4} className='track-info-favorites'>
                                <i className='tdicon-heart playlist-social-icon'></i>
                                {helpers.numberToCommaString(track.resolved.favoritings_count)}
                            </Columns>
                        </Columns>
                    </td>
                </tr>
            );
        }.bind(this));

        return (
            <Row className='playlist'>
                <table className='playlist-table' border={1}>
                    <tbody>
                        {playlist}
                    </tbody>
                </table>
            </Row>
        );
    }
});

module.exports = Playlist;
