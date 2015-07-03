var React = require('react');

var Columns = require('../../Columns');
var Row = require('../../Row');

var Volume = React.createClass({
    mixins: [
        require('../../mixins/PlayerControls')
    ],
    render: function() {
        var volume = this.props.volume;

        var activeVolumeClass;

        if(volume === 0) {
            activeVolumeClass = 'tdicon-volume-off';
        } else if(volume === 50) {
            activeVolumeClass = 'tdicon-volume-down';
        } else {
            activeVolumeClass = 'tdicon-volume-up';
        }
        
        return (
            <span>
                <i
                    className={'volume-init ' + activeVolumeClass}
                    onClick={this.onShowVolumeControlsClick}
                    style={{display: this.state.showVolumeOptions ? 'none' : ''}}
                />
                <Columns
                    large-centered={true}
                    small-centered={true}
                    className='volume-select'
                    style={{display: this.state.showVolumeOptions ? '' : 'none'}}
                >
                    <i
                        className={'tdicon-volume-off volume-off ' + (volume === 0 ? 'volume-active' : '')}
                        data-className='tdicon-volume-off'
                        onClick={this.onSetVolumeClick.bind(null, 0)}
                    />
                    <i
                        className={'tdicon-volume-down volume-med ' + (volume === 50 ? 'volume-active' : '')}
                        data-className='tdicon-volume-down'
                        onClick={this.onSetVolumeClick.bind(null, 50)}
                    />
                    <i
                        className={'tdicon-volume-up volume-max ' + (volume === 100 ? 'volume-active' : '')}
                        data-className='tdicon-volume-up'
                        onClick={this.onSetVolumeClick.bind(null, 100)}
                    />
                </Columns>
            </span>
        );
    }
});

module.exports = Volume;
