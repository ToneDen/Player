var React = require('react');

var Columns = require('../Columns');
var Loader = require('../Loader');
var PlaybackButtons = require('./common/PlaybackButtons');
var Row = require('../Row');
var RepeatButton = require('./common/RepeatButton');
var Scrubber = require('./common/Scrubber');
var Volume = require('./common/Volume');

var helpers = require('../../../helpers');

var Single = React.createClass({
    render: function() {
        var player = this.props.player;
        var isSmallContainer = player.getIn(['container', 'offsetWidth']) < 400;

        if(player.get('loading')) {
            return <Loader />;
        }

        var nowPlaying = player.get('nowPlaying');
        var resolved = nowPlaying.get('resolved');

        return (
            <Columns large-centered={true} small-centered={true}>
                <a href='https://www.toneden.io' target='_blank' className='tdicon-td_logo-link'>
                    <i className='tdicon-td_logo' />
                </a>
                <Columns
                    className={'header ' + (isSmallContainer ? 'header-small' : '')}
                    large={4}
                    small={12}
                    style={{width: isSmallContainer ? '100%' : undefined}}
                >
                    <Columns className='cover'>
                        <div className='solo-cover'>
                            <img src={resolved.get('artwork_url') || resolved.getIn(['user', 'avatar_url'])} />
                        </div>
                        <div className='controls'>
                            <PlaybackButtons
                                className='buttons'
                                ref='playbackButtons'
                                showNextAndPrevious={player.get('tracks').size > 1}
                                {...this.props}
                            />
                        </div>
                    </Columns>
                    <Columns className='solo-buttons'>
                        <Columns
                            large={resolved.get('purchase_url') || resolved.get('download_url') ? 6 : 12}
                            small={12}
                            className='follow'
                        >
                            <a className='tdbutton expand follow-link' href={resolved.get('permalink_url')} target='_blank'>
                                <i className='tdicon-soundcloud playlist-social-icon' />
                            </a>
                        </Columns>
                        <Columns large={6} small={12} className='buy'>
                            <a
                                className='tdbutton expand buy-link'
                                href={resolved.get('purchase_url') || resolved.get('download_url')}
                                target='_blank'
                            >
                                {this.props.useCustomPurchaseTitle ? resolved.get('purchase_title') : 'BUY'}
                                {!resolved.get('purchase_url') && 'DOWNLOAD'}
                            </a>
                        </Columns>
                    </Columns>
                </Columns>
                <Columns
                    className={'solo-container ' + (isSmallContainer ? 'solo-container-small' : '')}
                    large={8}
                    small={12}
                    style={{width: isSmallContainer ? '100%' : ''}}
                >
                    <Row className='info-solo'>
                        <Columns large={2} small={12} className='repeat-column'>
                            <RepeatButton repeat={this.props.repeat} />
                        </Columns>
                        <Columns large={8} small={12} className='info'>
                            <Columns className='song-name'>
                                <a href={resolved.get('permalink_url')} target='_blank'>
                                    {resolved.get('title')}
                                </a>
                            </Columns>
                            <Columns className='artist-name'>
                                <a href={resolved.getIn(['user', 'permalink_url'])} target='_blank'>
                                    {resolved.getIn(['user', 'username'])}
                                </a>
                            </Columns>
                        </Columns>
                        <Columns large={2} small={12} className='volume-controls'>
                            <Volume volume={this.props.volume} />
                        </Columns>
                    </Row>
                    {nowPlaying.get('error') && (
                        <Row>
                            <Columns>
                                <Columns className='track-error-box'>
                                    <span className='track-error-box-span'>
                                        <i className='tdicon-warning' />
                                        {nowPlaying.get('errorMessage')}
                                    </span>
                                </Columns>
                            </Columns>
                        </Row>
                    )}
                    {!nowPlaying.get('error') && (
                        <Row className='scrubber' style={{display: isSmallContainer ? 'none' : ''}}>
                            <Scrubber nowPlaying={nowPlaying} />
                        </Row>
                    )}
                    <Row className='social'>
                        <Columns className='current-song-info'>
                            <Columns large={6} className='track-info-plays'>
                                <i className='tdicon-play-circle-fill current-song-social-icon'></i>
                                {helpers.numberToCommaString(resolved.get('playback_count'))}
                            </Columns>
                            <Columns large={6} className='track-info-favorites'>
                                <i className='tdicon-heart current-song-social-icon' />
                                {helpers.numberToCommaString(resolved.get('favoritings_count'))}
                            </Columns>
                        </Columns>
                    </Row>
                </Columns>
            </Columns>
        );
    }
});

module.exports = Single;
