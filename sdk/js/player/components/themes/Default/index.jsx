var _ = require('lodash');
var Fluxxor = require('fluxxor');
var React = require('react');

var Columns = require('../../Columns');
var Controls = require('./Controls');
var Loader = require('../../Loader');
var NowPlaying = require('./NowPlaying');
var Row = require('../../Row');
var Playlist = require('./Playlist');
var Scrubber = require('../common/Scrubber');
var SocialInfo = require('./SocialInfo');

var helpers = require('../../../../helpers');

var Default = React.createClass({
    mixins: [
        Fluxxor.FluxMixin(React)
    ],
    getInitialState: function() {
        return {
            isScrubbing: false
        };
    },
    render: function() {
        var nowPlaying = this.props.nowPlaying;
        var tracks = this.props.tracks;

        if(this.props.loading || !nowPlaying.resolved || !tracks) {
            return <Loader />;
        }

        return (
            <Columns large-centered={true} className='tdbody'>
                <a href='https://www.toneden.io' target='_blank' className='tdicon-td_logo-link'>
                    <i className='tdicon-td_logo' />
                </a>
                <NowPlaying nowPlaying={nowPlaying} />
                <SocialInfo {...this.props} />
                <Controls {...this.props} />
                <Row className='scrubber'>
                    <Scrubber nowPlaying={nowPlaying} />
                </Row>
                <Playlist {...this.props} />
            </Columns>
        );
    }
});

module.exports = Default;
