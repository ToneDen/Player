var React = require('react');

var Columns = require('../../Columns');
var Row = require('../../Row');

var NowPlaying = React.createClass({
    render: function() {
        var nowPlaying = this.props.nowPlaying;

        return (
            <span>
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
            </span>
        );
    }
});

module.exports = NowPlaying;
