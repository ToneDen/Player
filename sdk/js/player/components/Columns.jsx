/**
 * Abstraction for a div with a certain number of columns in Foundation's CSS framework.
 * Takes a 'large' and a 'small' prop, telling the div how many columns to have.
 */

var React = require('react');

var Columns = React.createClass({
    getDefaultProps: function() {
        return {
            id: ''
        };
    },
    render: function() {
        var divClass = 'tdcolumns ';

        var large = this.props.large;

        if(!this.props.large && !this.props.small) {
            large = 12;
        }

        if(large) {
            divClass += 'tdlarge-' + large;
        }

        if(this.props.small) {
            divClass += ' tdsmall-' + this.props.small;
        } else {
            divClass += ' tdsmall-' + large;
        }

        if(this.props.offset) {
            divClass += ' tdoffset-' + this.props.offset;
        }

        if(this.props.centered) {
            divClass += ' tdcolumns-centered';
        }

        if(this.props['large-centered']) {
            divClass += ' tdlarge-centered';
        }

        if(this.props['small-centered']) {
            divClass += ' tdsmall-centered';
        }

        if(this.props['large-offset']) {
            divClass += ' tdlarge-offset-' + this.props['tdlarge-offset'];
        }

        if(this.props.className) {
            divClass += ' ' + this.props.className;
        }

        return (
            <div id={this.props.id} className={divClass} style={this.props.style || {}}>
                {this.props.children}
            </div>
        );
    }
});

module.exports = Columns;
