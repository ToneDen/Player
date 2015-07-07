var React = require('react');

var Columns = require('../Columns');
var Loader = require('../Loader');
var Row = require('../Row');
var Scrubber = require('./common/Scrubber');

var helpers = require('../../../helpers');

var Mini = React.createClass({
    mixins: [
        require('../mixins/PlayerControls')
    ],
    render: function() {
        if(this.props.loading) {
            return <Loader />;
        }

        var nowPlaying = this.props.nowPlaying;
        var playButtonClass;

        if(nowPlaying.playing) {
            playButtonClass = 'tdicon-pause-circle-outline player-play play';
        } else {
            playButtonClass = 'tdicon-play-circle-outline player-play play';
        }

        return (
            <span>
                <Columns large={1} small={12} className='controls mini-controls'>
                    <Columns className='buttons mini-buttons'>
                        <i className='tdicon-angle-double-left player-prev prev' onClick={this.onPreviousButtonClick} />
                        <i className={playButtonClass} onClick={this.onPlayButtonClick} />
                        <i className='tdicon-angle-double-right player-next next' onClick={this.onNextButtonClick} />
                    </Columns>
                </Columns>
                {nowPlaying.error && (
                    <Columns large={3} small={12}>
                        <Columns className='track-error-box'>
                            <span className='track-error-box-span'>
                                <i className='tdicon-warning' />
                                {nowPlaying.errorMessage}
                            </span>
                        </Columns>
                    </Columns>
                )}
                {(!nowPlaying.error && !nowPlaying.resolved.streamable) && (
                    <Columns large={3} small={12}>
                        <Columns large={12} small={12} className='track-error-box'>
                            <span className='track-error-box-span'>
                                <i className='tdicon-warning' />
                                This track is not streamable.
                            </span>
                        </Columns>
                    </Columns>
                )}
                {(!nowPlaying.error && nowPlaying.resolved.streamable) && (
                    <Columns large={3} small={12} className='mini-scrubber'>
                        <Scrubber nowPlaying={nowPlaying} />
                    </Columns>
                )}
                <Columns large={4} small={12} className='mini-info'>
                    <Columns className='mini-song-info'>
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
                    </Columns>
                </Columns>
                <ul className='tdlarge-3 tdsmall-12 tdcolumns mini-social'>
                    <li className='track-info-plays'>
                        <i className='tdicon-play-circle-fill current-song-social-icon' />
                        {helpers.numberToCommaString(nowPlaying.resolved.playback_count)}
                    </li>
                    <li className='track-info-favorites'>
                        <i className='tdicon-heart current-song-social-icon' />
                        {helpers.numberToCommaString(nowPlaying.resolved.favoritings_count)}
                    </li>
                </ul>
                <Columns large={1} small={12} className='mini-connect'>
                    {nowPlaying.resolved.purchase_url && (
                        <Columns large={8} small={6} className='buy'>
                            <a className='button expand buy-link' href={nowPlaying.resolved.permalink_url} target='_blank'>
                                {this.props.useCustomPurchaseTitle ? nowPlaying.resolved.purchase_title : 'BUY'}
                            </a>
                        </Columns>
                    )}
                    {!nowPlaying.resolved.purchase_url && (
                        <Columns large={8} small={6} className='buy'>
                            <a className='button expand buy-link' href={nowPlaying.resolved.download_url}  target='_blank'>
                                DOWNLOAD
                            </a>
                        </Columns>
                    )}
                    <Columns large={4} small={6} className='follow'>
                        <a className='button expand follow-link' href={nowPlaying.resolved.permalink_url} target='_blank'>
                            <i className='tdicon-soundcloud playlist-social-icon' />
                        </a>
                    </Columns>
                </Columns>
            </span>
        );
    }
});

module.exports = Mini;
