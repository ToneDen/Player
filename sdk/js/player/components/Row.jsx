/**
 * Abstraction for a row in Foundation's CSS framework.
 */

var React = require('react');

var Row = React.createClass({
    render: function() {
        return (
            <div
                className={'tdrow ' + (this.props.className || '')}
                id={this.props.id || ''}
                style={this.props.style || {}}
            >
                {this.props.children}
            </div>
        );
    }
});

module.exports = Row;
