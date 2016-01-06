var Fluxxor = require('fluxxor');
var React = require('react');

var Columns = require('../../Columns');
var Loader = require('../../Loader');
var Row = require('../../Row');
var SocialInfo = require('./SocialInfo');

var Feed = React.createClass({
    mixins: [
        Fluxxor.FluxMixin(React),
        require('../../mixins/PlayerControls')
    ],
    renderFeedInfo: function() {
        var player = this.props.player;
        var nowPlaying = player.get('nowPlaying');
        var resolved = nowPlaying.get('resolved');
        var hasError = nowPlaying.get('error');
        var hasTitle = resolved.get('title');

        if(hasError && !hasTitle) {
            return (
                <Columns large={12} small={12} className='feed-container'>
                    <Row className='tdrow info-feed'>
                        <Columns large={12} small={12} className='track-error-box'>
                            <span className='track-error-box-span'>
                                <i className='tdicon-warning' />
                                {nowPlaying.get('errorMessage')}
                            </span>
                        </Columns>
                    </Row>
                    <SocialInfo nowPlaying={nowPlaying} />
                </Columns>
            );
        } else {
            return (
                <Columns large={hasError ? 12 : 10} small={12} className='feed-container'>
                    <Row className='tdrow info-feed'>
                        <Columns className='info'>
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
                    <SocialInfo nowPlaying={nowPlaying} />
                </Columns>
            );
        }
    },
    render: function() {
        var player = this.props.player;
        var nowPlaying = player.get('nowPlaying');
        var playButtonClass;

        if(player.get('loading') || !nowPlaying) {
            return <Loader />
        }

        var resolved = nowPlaying.get('resolved');

        if(nowPlaying.get('playing')) {
            playButtonClass = 'tdicon-pause-circle-outline player-play play';
        } else {
            playButtonClass = 'tdicon-play-circle-outline player-play play';
        }

        return (
            <Columns large-centered={true} small-centered={true}>
                {!nowPlaying.get('error') &&
                    <Columns large={2} small={12} className='header'>
                        <Columns className='cover'>
                            <div className='feed-cover'>
                                <img src={resolved.get('artwork_url') || resolved.getIn(['user', 'avatar_url'])} />
                            </div>
                            <div className='controls'>
                                <Columns className='buttons'>
                                    <i className={playButtonClass} onClick={this.onPlayButtonClick} />
                                </Columns>
                            </div>
                        </Columns>
                    </Columns>
                }
                {this.renderFeedInfo()}
            </Columns>
        );
    }
});

module.exports = Feed;
