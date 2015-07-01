var _ = require('lodash');
var React = require('react');

var Columns = require('../Columns');
var Loader = require('../Loader');
var Row = require('../Row');
var Slider = require('react-slider');

var helpers = require('../../../helpers');

var Default = React.createClass({
    mixins: [
        require('../mixins/PlayerControls')
    ],
    componentDidMount: function() {
        var container = this.props.container;

        // Container responsiveness
        if(container.width() < 500) {
            container.find('.current-song-info').css('width', '100%').prependTo(container.find('.social'));
            container.find('.buy').hide();
            container.find('.follow').hide();
            container.find('.track-info-stats').hide();
        }

        if(container.height() < 500 && this.props.shrink === true) {
            container.find('.player').addClass('shrink');
        }
    },
    render: function() {
        if(this.props.loading) {
            return (
                <Row className={'td player ' + this.props.skin}>
                    <Loader />
                </Row>
            );
        }

        var nowPlaying = this.props.nowPlaying;
        var tracks = this.props.tracks;

        var playlist = tracks.map(function(track, index) {
            return (
                <tr
                    className={track.playing ? 'playing' : 'track-info'}
                    key={track.id}
                    onClick={this.onTrackRowClick.bind(null, track.id)}
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
                    <td className='track-info-stats' style={{width: '40%'}}>
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

        var scrubber;

        if(nowPlaying.error) {
            scrubber = (
                <Row>
                    <Columns>
                        <Columns className='track-error-box'>
                            <span className='track-error-box-span'>
                                <i className='tdicon-warning' />
                                {nowPlaying.errorMessage}
                            </span>
                        </Columns>
                    </Columns>
                </Row>
            );
        } else if(!nowPlaying.resolved.streamable) {
            scrubber = (
                <Row>
                    <Columns>
                        <Columns className='track-error-box'>
                            <span className='track-error-box-span'>
                                <i className='tdicon-warning' />
                                This track is not streamable.
                            </span>
                        </Columns>
                    </Columns>
                </Row>
            );
        } else {
            scrubber = (
                <Row className='scrubber'>
                    <Columns className='scrubber-box'>
                        <Columns large={2} className='start-time'>
                            {helpers.msToTimestamp(nowPlaying.playbackPosition || 0)}
                        </Columns>
                        <Columns large={8} className='scrub-bar-box'>
                            <Slider
                                max={nowPlaying.resolved.duration}
                                onAfterChange={this.onScrubberValueChange}
                                value={nowPlaying.playbackPosition}
                            >
                                <i className='tdicon-heart' />
                            </Slider>
                        </Columns>
                        <Columns large={2} className='stop-time'>
                            {helpers.msToTimestamp(nowPlaying.resolved.duration - (nowPlaying.playbackPosition || 0))}
                            {nowPlaying.loading && <i className='tdicon-circle-o-notch spin tdloader' />}
                        </Columns>
                    </Columns>
                </Row>
            );
        }

        var playButtonClass;

        if(nowPlaying.playing) {
            playButtonClass = 'tdicon-pause-circle-outline player-play play';
        } else {
            playButtonClass = 'tdicon-play-circle-outline player-play play';
        }

        return (
            <Columns large-centered={true} className='tdbody'>
                <a href='https://www.toneden.io' target='_blank' className='tdicon-td_logo-link'>
                    <i className='tdicon-td_logo' />
                </a>
                <Row className='header'>
                    <Columns className='cover'>
                        <div className='cover-img'>
                            <img src={nowPlaying.resolved.artwork_url || nowPlaying.resolved.user.avatar_url} />
                        </div>
                    </Columns>
                    <Columns large={12} small={6} className='waveform' />
                </Row>
                <Row className='info'>
                    <Columns className='song-name'>
                        <a href={nowPlaying.resolved.permalink_url} target='_blank'>
                            {nowPlaying.resolved.title}
                        </a>
                    </Columns>
                    <Columns className='artist-name'>
                        <a href={nowPlaying.resolved.user.permalink_url} target='_blank'>
                            {nowPlaying.resolved.user.username}
                        </a>
                    </Columns>
                </Row>
                <Row className='social'>
                    <Columns
                        className='follow'
                        large={(nowPlaying.resolved.purchase_url || nowPlaying.resolved.download_url) ? 3 : 6}
                        small={12}
                    >
                        <a className='tdbutton expand follow-link' href={nowPlaying.resolved.permalink_url}  target='_blank'>
                            <i className='tdicon-soundcloud playlist-social-icon'></i>
                        </a>
                    </Columns>
                    <Columns large={6} small={12} className='current-song-info'>
                        <Columns large={6} small={6} className='track-info-plays'>
                            <i className='tdicon-play-circle-fill current-song-social-icon'></i>
                            {helpers.numberToCommaString(nowPlaying.resolved.playback_count)}
                        </Columns>
                        <Columns large={6} small={6} className='track-info-favorites'>
                            <i className='tdicon-heart current-song-social-icon'></i>
                            {helpers.numberToCommaString(nowPlaying.resolved.favoritings_count)}
                        </Columns>
                    </Columns>
                    {nowPlaying.resolved.purchase_url && (
                        <Columns large={3} small={12} className='buy'>
                            <a className='tdbutton expand  buy-link' href='{{purchase_url}}' target='_blank'>
                                {this.props.useCustomPurchaseTitle && nowPlaying.resolved.purchase_title || 'BUY'}
                            </a>
                        </Columns>
                    )}
                    {!nowPlaying.resolved.purchase_url && nowPlaying.resolved.download_url && (
                        <Columns large={3} small={12} className='buy'>
                            <a className='tdbutton expand buy-link' href={nowPlaying.resolved.download_url} target='_blank'>
                                DOWNLOAD
                            </a>
                        </Columns>
                    )}
                </Row>
                <Row className='controls'>
                    <Columns className='buttons'>
                        <Columns large={3} small={12}>
                            <i className={'tdicon-repeat repeat-init ' + (this.props.repeat ? 'repeat-on' : '')} />
                        </Columns>
                        <Columns large={6} small={12} className='button-controls'>
                            <i className='tdicon-angle-double-left player-prev prev' onClick={this.onPreviousButtonClick} />
                            <i className={playButtonClass} onClick={this.onPlayButtonClick} />
                            <i className='tdicon-angle-double-right player-next next' onClick={this.onNextButtonClick} />
                        </Columns>
                        <Columns large={3} small={12} className='volume-controls'>
                            <i className='tdicon-volume-up volume-init' />
                            <Columns
                                large-centered={true}
                                small-centered={true}
                                className='volume-select'
                                style={{display: 'none'}}
                            >
                                <i className='tdicon-volume-off volume-off' data-className='tdicon-volume-off' />
                                <i className='tdicon-volume-down volume-med' data-className='tdicon-volume-down' />
                                <i className='tdicon-volume-up volume-max volume-active' data-className='tdicon-volume-up' />
                            </Columns>
                        </Columns>
                    </Columns>
                </Row>
                {scrubber}
                <Row className='playlist'>
                    <table className='playlist-table' border={1}>
                        <tbody>
                            {playlist}
                        </tbody>
                    </table>
                </Row>
            </Columns>
        );
    }
});

module.exports = Default;
