var React = require('react');

var Columns = require('../../Columns');
var Row = require('../../Row');

var helpers = require('../../../../helpers');

var SocialInfo = React.createClass({
    render: function() {
        var nowPlaying = this.props.nowPlaying;

        return (
            <Row className='social'>
                <Columns className='current-song-info'>
                    <Columns large={10} small={10} className='track-info-plays'>
                        <i className='tdicon-play-circle-fill current-song-social-icon' />
                        {helpers.numberToCommaString(nowPlaying.resolved.playback_count)}
                    </Columns>
                    <Columns large={2} small={2} className='feed-buttons'>
                        <Columns
                            large={nowPlaying.resolved.purchase_url || nowPlaying.resolved.download_url ? 6 : 12}
                            small={12}
                            className='follow'
                        >
                            <a
                                className='tdbutton expand follow-link'
                                href={nowPlaying.resolved.permalink_url}
                                target='_blank'
                            >
                                <i className='tdicon-soundcloud playlist-social-icon' />
                            </a>
                        </Columns>
                        {(nowPlaying.resolved.purchase_url || nowPlaying.resolved.download_url) && (
                            <Columns large={6} small={12} className='buy'>
                                <a
                                    className='tdbutton expand buy-link'
                                    href={nowPlaying.resolved.purchase_url || nowPlaying.resolved.download_url}
                                    target='_blank'
                                >
                                    <i className='tdicon-file-download playlist-social-icon' />
                                </a>
                            </Columns>
                        )}
                    </Columns>
                </Columns>
            </Row>
        );
    }
});

module.exports = SocialInfo;
