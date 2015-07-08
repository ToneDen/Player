var React = require('react');

var Columns = require('../../Columns');
var Row = require('../../Row');

var helpers = require('../../../../helpers');

var SocialInfo = React.createClass({
    render: function() {
        var player = this.props.player.toJS();
        var nowPlaying = player.nowPlaying;
        var sizeHideStyle = {
            display: player.container.offsetWidth < 500 ? 'none' : ''
        };

        return (
            <Row className='social'>
                <Columns
                    className='follow'
                    large={(nowPlaying.resolved.purchase_url || nowPlaying.resolved.download_url) ? 3 : 6}
                    small={12}
                    style={sizeHideStyle}
                >
                    <a className='tdbutton expand follow-link' href={nowPlaying.resolved.permalink_url}  target='_blank'>
                        <i className='tdicon-soundcloud playlist-social-icon'></i>
                    </a>
                </Columns>
                <Columns large={player.container.offsetWidth < 500 ? 12 : 6} small={12} className='current-song-info'>
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
                    <Columns large={3} small={12} className='buy' style={sizeHideStyle}>
                        <a className='tdbutton expand  buy-link' href='{{purchase_url}}' target='_blank'>
                            {player.useCustomPurchaseTitle && nowPlaying.resolved.purchase_title || 'BUY'}
                        </a>
                    </Columns>
                )}
                {!nowPlaying.resolved.purchase_url && nowPlaying.resolved.download_url && (
                    <Columns large={3} small={12} className='buy' style={sizeHideStyle} >
                        <a className='tdbutton expand buy-link' href={nowPlaying.resolved.download_url} target='_blank'>
                            DOWNLOAD
                        </a>
                    </Columns>
                )}
            </Row>
        );
    }
});

module.exports = SocialInfo;
