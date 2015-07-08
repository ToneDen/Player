var Fluxxor = require('fluxxor');;
var React = require('react');

var Columns = require('../../Columns');
var PlaybackButtons = require('../common/PlaybackButtons');
var RepeatButton = require('../common/RepeatButton');
var Row = require('../../Row');
var Volume = require('../common/Volume');

var Controls = React.createClass({
    mixins: [
        Fluxxor.FluxMixin(React),
        require('../../mixins/PlayerControls')
    ],
    render: function() {
        return (
            <Row className='controls'>
                <Columns className='buttons'>
                    <Columns large={3} small={12}>
                        <RepeatButton repeat={this.props.player.get('repeat')} />
                    </Columns>
                    <PlaybackButtons large={6} small={12} className='button-controls' {...this.props} />
                    <Columns large={3} small={12} className='volume-controls'>
                        <Volume volume={this.props.player.get('volume')} />
                    </Columns>
                </Columns>
            </Row>
        );
    }
});

module.exports = Controls;
