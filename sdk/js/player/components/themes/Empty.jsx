var React = require('react');

var Empty = React.createClass({
    render: function() {
        return (
            <div className={'td tdrow player ' + this.props.skin}>
                <div class='tdempty tdlarge-12 tdsmall-12 tdsmall-centered tdlarge-centered'>
                    <a href='https://www.toneden.io' target='_blank' className='icon-td_logo-link'>
                        <i class='icon-td_logo' />
                    </a>
                    There are no tracks to play.
                </div>
            </div>
        );
    }
});

module.exports = Empty;
