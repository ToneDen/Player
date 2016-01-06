var React = require('react');

var Columns = require('../Columns');
var Loader = require('../Loader');
var PlaybackButtons = require('./common/PlaybackButtons');
var Row = require('../Row');
var RepeatButton = require('./common/RepeatButton');
var Scrubber = require('./common/Scrubber');
var Volume = require('./common/Volume');

var helpers = require('../../../helpers');

var Full = React.createClass({
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
                <Columns
                    className={'header ' + (isSmallContainer ? 'header-small' : '')}
                    large={12}
                    small={12}
                    style={{width: isSmallContainer ? '100%' : undefined}}
                >
                    <Columns className='cover'>
                        <div className='solo-cover'>
                            <img src={resolved.get('artwork_url') || resolved.getIn(['user', 'avatar_url'])} />
                        </div>
                        <Columns
                            className={'solo-container ' + (isSmallContainer ? 'solo-container-small' : '')}
                            large={12}
                            small={12}
                            style={{width: isSmallContainer ? '100%' : ''}}
                        >
                            <Row className='info-solo'>
                                <Columns large={12} small={12} className='info'>
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
                        </Columns>
                        <Columns className='controls'>
                            <Columns large={2} small={12} className='repeat-column'>
                                <RepeatButton repeat={player.get('repeat')} />
                            </Columns>
                            <Columns large={8} small={12}>
                                <PlaybackButtons
                                    className='buttons'
                                    ref='playbackButtons'
                                    showNextAndPrevious={player.get('tracks').size > 1}
                                    {...this.props}
                                />
                            </Columns>
                            <Columns large={2} small={12} className='volume-controls'>
                                <Volume volume={player.get('volume')} />
                            </Columns>
                        </Columns>
                    </Columns>
                </Columns>
            </Columns>
        );
    }
});

module.exports = Full;
