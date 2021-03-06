import React from 'react';
import Icon from 'react-fa';
import 'common/asset/less/common/collapsible.less';

class Collapsible extends React.Component {
    constructor(props) {
        super();
        this.state = {
            collapsed: props.initialCollapsed || false
        };
    }

    _collapse() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    render() {
        return <div className={'collapsible' + (this.state.collapsed ? ' is-collapsed' : '')} {...this.props}>
                    <header
                        onClick={this._collapse.bind(this)}>
                        {this.state.collapsed ?
                            <Icon fixedWidth name='caret-right' /> :
                            <Icon fixedWidth name='caret-down' />} {this.props.header}
                    </header>
                    <div style={{ display: this.state.collapsed ? 'none' : null}} {...this.props}>
                        {this.props.children}
                    </div>
                </div>;
    }
}

Collapsible.displayName = 'Collapsible';

//TODO define children more in detail
Collapsible.propTypes = {
    children: React.PropTypes.any,
    header: React.PropTypes.string,
    initialCollapsed: React.PropTypes.bool
};

export default Collapsible;
