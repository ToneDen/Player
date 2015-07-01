var React = require('react');

var Mini = React.createClass({
    render: function() {
        if(this.props.loading) {
            return (
                <div classNameNameName={'td tdrow player ' + this.props.skin}>
                    <Loader />
                </div>
            );
        }
    }
});

module.exports = Mini;
