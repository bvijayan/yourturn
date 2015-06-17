import React from 'react';
import Icon from 'react-fa';
import {Link} from 'react-router';
import Timestamp from 'react-time';
import request from 'common/src/superagent';
import {Provider, RequestConfig, saveRoute} from 'common/src/oauth-provider';
import 'common/asset/less/yourturn/sidebar.less';

class Sidebar extends React.Component {
    constructor(props) {
        super();
        this.actions = props.flux.getActions('user');
        this.store = props.flux.getStore('user');
        this.interval = false;
        this.state = {
            isTokenValid: true
        };
    }

    login() {
        request
            .get('does.not.matter')
            .oauth(Provider, RequestConfig)
            .requestAccessToken(saveRoute);
    }

    refresh() {
        this.logout();
        this.login();
    }

    logout() {
        this.actions.deleteTokenInfo();
    }

    updateExpiryDate() {
        let tokeninfo = this.store.getTokenInfo(),
            NOW = Date.now();
        this.setState({
            currentDate: NOW,   // to enforce state change
            isTokenValid: NOW < tokeninfo.valid_until
        });
    }

    componentDidMount() {
        this.interval = setInterval(this.updateExpiryDate.bind(this), 5000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    transition(route) {
        this.context.router.transitionTo(route);
    }

    render() {
        let tokeninfo = this.store.getTokenInfo();
        return <aside className='sidebar'>
                    <div className='sidebar-content'>
                        <div className='header'>
                        {tokeninfo ?
                            <div>
                                <div className='userInfo'>
                                    <span className='userImage' />
                                    <span>{tokeninfo.uid}</span>
                                </div>
                                <div className='tokenInfo'>
                                    <div>
                                        <small>
                                            OAuth Token {this.state.isTokenValid ? 'expires' : 'expired'} <Timestamp value={tokeninfo.valid_until} relative={true} />.
                                        </small>
                                    </div>
                                    <div className='btn-group'>
                                        <button
                                            onClick={this.refresh.bind(this)}
                                            className='btn btn-default'>
                                            <Icon name='refresh' /> Refresh
                                        </button>
                                        <button
                                            onClick={this.logout.bind(this)}
                                            className='btn btn-default'>
                                            <Icon name='sign-out' /> Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                            :
                            <div className='tokenInfo'>
                                <div>You are not logged in.</div>
                                <div className='btn-group'>
                                    <button
                                        onClick={this.login.bind(this)}
                                        className='btn btn-default'>
                                        <Icon name='sign-in' /> Log in
                                    </button>
                                </div>
                            </div>
                        }
                        </div>
                        <div
                            className='sidebar-item'
                            onClick={this.transition.bind(this, 'search')}>
                            <Link
                                to='search'>
                                Search <Icon name='search' />
                            </Link>
                        </div>
                        <div
                            className='sidebar-item'
                            onClick={this.transition.bind(this, 'application-appList')}>
                            <Link
                                to='application-appList'>
                                Applications <Icon name='cubes' />
                            </Link>
                        </div>
                        <div
                            className='sidebar-item'
                            onClick={this.transition.bind(this, 'resource-resList')}>
                            <Link
                                to='resource-resList'>
                                Resource Types <Icon name='key' />
                            </Link>
                        </div>
                        <div
                            className='sidebar-item'
                            onClick={this.transition.bind(this, 'violation-vioList')}>
                            <Link
                                to='violation-vioList'>
                                Violations <Icon name='warning' />
                            </Link>
                        </div>
                    </div>
                </aside>;
    }
}
Sidebar.displayName = 'Sidebar';
Sidebar.contextTypes = {
    router: React.PropTypes.func.isRequired
};

export default Sidebar;