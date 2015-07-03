var React = require('react');

var Columns = require('../Columns');
var Row = require('../Row');

var Empty = React.createClass({
    render: function() {
        return (
            <Row className={'td player ' + this.props.skin}>
                <Columns large={12} large-centered={true} small-centered={true} className='tdempty'>
                    <a href='https://www.toneden.io' target='_blank' className='icon-td_logo-link'>
                        <i className='icon-td_logo' />
                    </a>
                    There are no tracks to play.
                </Columns>
            </Row>
        );
    }
});

module.exports = Empty;
