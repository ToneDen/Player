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
    render: function() {
        var player = this.props.player;

        if(player.get('loading')) {
            return <Loader />
        }

        var nowPlaying = player.get('nowPlaying');
        var resolved = nowPlaying.get('resolved');
        var playButtonClass;

        if(nowPlaying.get('playing')) {
            playButtonClass = 'tdicon-pause-circle-outline player-play play';
        } else {
            playButtonClass = 'tdicon-play-circle-outline player-play play';
        }

        return (
            <Columns large-centered={true} small-centered={true}>
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
                <Columns large={10} small={12} className='feed-container'>
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
                    <SocialInfo nowPlaying={nowPlaying} />
                </Columns>
            </Columns>
        );
    }
});

module.exports = Feed;
