var React = require('react');

var Columns = require('../../Columns');
var Row = require('../../Row');

var NowPlaying = React.createClass({
    render: function() {
        var nowPlaying = this.props.nowPlaying;
        var resolved = nowPlaying.get('resolved');

        return (
            <span>
                <Row className='header'>
                    <Columns className='cover'>
                        <div className='cover-img'>
                            <img src={resolved.get('artwork_url') || resolved.getIn(['user', 'avatar_url'])} />
                        </div>
                    </Columns>
                    <Columns large={12} small={6} className='waveform' />
                </Row>
                <Row className='info'>
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
                </Row>
            </span>
        );
    }
});

module.exports = NowPlaying;
