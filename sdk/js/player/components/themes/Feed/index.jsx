var React = require('react');

var Columns = require('../../Columns');
var Loader = require('../../Loader');
var Row = require('../../Row');
var SocialInfo = require('./SocialInfo');

var Feed = React.createClass({
    mixins: [
        require('../../mixins/PlayerControls')
    ],
    render: function() {
        var nowPlaying = this.props.nowPlaying;

        if(this.props.loading) {
            return <Loader />
        }

        var playButtonClass;

        if(nowPlaying.playing) {
            playButtonClass = 'tdicon-pause-circle-outline player-play play';
        } else {
            playButtonClass = 'tdicon-play-circle-outline player-play play';
        }

        return (
            <Columns large-centered={true} small-centered={true}>
                <Columns large={2} small={12} className='header'>
                    <Columns className='cover'>
                        <div className='feed-cover'>
                            <img src={nowPlaying.resolved.artwork_url || nowPlaying.resolved.user.avatar_url} />
                        </div>
                        <div className='controls'>
                            <Columns className='buttons'>
                                <i className={playButtonClass} onClick={this.onPlayButtonClick} />
                            </Columns>
                        </div>
                    </Columns>
                </Columns>
                <Columns large={10} small={12} className='feed-container'>
                    <Row className='tdrow info-feed'>
                        <Columns className='info'>
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
                    </Row>
                    {nowPlaying.error && (
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
                    )}
                    {!nowPlaying.error && !nowPlaying.resolved.streamable && (
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
                    )}
                    <SocialInfo nowPlaying={nowPlaying} />
                </Columns>
            </Columns>
        );
    }
});

module.exports = Feed;
