import React from 'react';
import {Route, DefaultRoute} from 'react-router';
import moment from 'moment';
import Icon from 'react-fa';
import lzw from 'lz-string';
import _ from 'lodash';

import Violation from './violation/violation.jsx';
import ViolationDetail from './violation-detail/violation-detail.jsx';

import REDUX from 'yourturn/src/redux';
import {requireAccounts, bindGettersToState, bindActionsToStore} from 'common/src/util';
import {connect} from 'react-redux';

import * as UserGetter from 'common/src/data/user/user-getter';
import * as TeamGetter from 'common/src/data/team/team-getter';
import * as FullstopGetter from 'common/src/data/fullstop/fullstop-getter';

import * as NotificationActions from 'common/src/data/notification/notification-actions';
import * as UserActions from 'common/src/data/user/user-actions';
import * as TeamActions from 'common/src/data/team/team-actions';
import * as FullstopActions from 'common/src/data/fullstop/fullstop-actions';

const FULLSTOP_ACTIONS = bindActionsToStore(REDUX, FullstopActions),
      USER_ACTIONS = bindActionsToStore(REDUX, UserActions),
      NOTIFICATION_ACTIONS = bindActionsToStore(REDUX, NotificationActions),
      TEAM_ACTIONS = bindActionsToStore(REDUX, TeamActions);

function parseQueryParams(params) {
    let result = {};
    // global parameters
    if (params.accounts) {
        result.accounts = params.accounts;
    }
    if (params.from) {
        result.from = moment(params.from);
    }
    if (params.to) {
        result.to = moment(params.to);
    }
    if (params.activeTab) {
        result.activeTab = parseInt(params.activeTab, 10);
    }
    if (params.showUnresolved) {
        result.showUnresolved = params.showUnresolved === 'true';
    }
    if (params.showResolved) {
        result.showResolved = params.showResolved === 'true';
    }
    if (params.sortAsc) {
        result.sortAsc = params.sortAsc === 'true';
    }

    // tab-specific parameters
    Object
    .keys(params)
    .forEach(param => {
        // they look like tab_variableCamelCase
        let [tab, variable] = param.split('_'); // eslint-disable-line
        if (variable) {
            if (['true', 'false'].indexOf(params[param]) >= 0) {
                result[param] = params[param] === 'true';
            } else {
                result[param] = params[param];
            }
        }
    });
    return result;
}

class ViolationHandler extends React.Component {
    constructor() {
        super();
    }
    render() {
        return <Violation
                    notificationActions={NOTIFICATION_ACTIONS}
                    fullstopActions={FULLSTOP_ACTIONS}
                    {...this.props} />;
    }
}
ViolationHandler.displayName = 'ViolationHandler';
ViolationHandler.willTransitionTo = function(transition, params, query) {
    // save last visited date
    FULLSTOP_ACTIONS.saveLastVisited(Date.now());
    let state = REDUX.getState(),
        defaultParams = FullstopGetter.getDefaultSearchParams(),
        queryParams = parseQueryParams(query),
        searchParams = FullstopGetter.getSearchParams(state.fullstop),
        selectedAccounts = UserGetter.getUserCloudAccounts(state.user), // these the user has access to
        {accounts} = searchParams; // these accounts are selected and active

    // break infinite transition loop
    if (query.activeTab &&
        query.showUnresolved &&
        query.showResolved &&
        query.sortAsc &&
        query.from &&
        query.to) {
        return;
    }

    // ensure default params are in url
    if (!queryParams.activeTab) {
        queryParams.activeTab = defaultParams.activeTab;
    }
    if (!queryParams.accounts) {
        // this might or might not have an effect since transition hook is fired before fetchData
        Array.prototype.push.apply(accounts, selectedAccounts.map(a => a.id));
    }
    if (!queryParams.showUnresolved && !queryParams.showResolved) {
        // query might not be empty (this is only the case when accessing via menubar)
        // but still have parameters missing
        // so we add the default ones
        queryParams.showUnresolved = defaultParams.showUnresolved;
        queryParams.showResolved = defaultParams.showResolved;
    }
    if (!queryParams.sortAsc) {
        queryParams.sortAsc = defaultParams.sortAsc;
    }
    if (!queryParams.from) {
        queryParams.from = defaultParams.from.toISOString();
    } else {
        queryParams.from = queryParams.from.toISOString();
    }
    if (!queryParams.to) {
        queryParams.to = defaultParams.to.toISOString();
    } else {
        queryParams.to = queryParams.to.toISOString();
    }
    transition.redirect('violation', {}, queryParams);
};
ViolationHandler.fetchData = function(routerState, state) {
    let promises = [],
        accounts = TeamGetter.getAccounts(state.team).length === 0 ?
                    TEAM_ACTIONS.fetchAccounts() :
                    Promise.resolve(TeamGetter.getAccounts(state.team)),
        searchParams = parseQueryParams(routerState.query);
    FULLSTOP_ACTIONS.updateSearchParams(searchParams);
    // tab-specific loadings
    if (searchParams.activeTab === 0) {
        // tab 1
        FULLSTOP_ACTIONS.fetchViolationCount(searchParams);
        if (searchParams.accounts && searchParams.accounts.length) {
            accounts.then(accs => {
                searchParams.accounts.forEach(acc => {
                    // for every account
                    // get its name
                    let account = accs.filter(account => account.id === acc)[0];
                    let alias = TeamGetter.getAlias(state.team, account.name);
                    // and ask the team service about it
                    if (!alias) {
                        TEAM_ACTIONS.fetchTeam(account.name);
                    }
                });
            });
        }
    } else if (searchParams.activeTab === 1) {
        // tab 2
        FULLSTOP_ACTIONS.fetchViolationCountIn(
            searchParams.cross_inspectedAccount ? searchParams.cross_inspectedAccount : searchParams.accounts[0],
            searchParams);
    } else if (searchParams.activeTab === 2) {
        // tab 3
        FULLSTOP_ACTIONS.fetchViolations(searchParams);
    }

    if (!Object.keys(FullstopGetter.getViolationTypes(state.fullstop)).length) {
        promises.push(FULLSTOP_ACTIONS.fetchViolationTypes());
    }

    promises.push(requireAccounts(state, USER_ACTIONS));
    return Promise.all(promises);
};
ViolationHandler.propTypes = {
    query: React.PropTypes.object.isRequired
};
ViolationHandler.contextTypes = {
    router: React.PropTypes.func.isRequired
};
let ConnectedViolationHandler = connect(state => ({
    userStore: bindGettersToState(state.user, UserGetter),
    fullstopStore: bindGettersToState(state.fullstop, FullstopGetter),
    teamStore: bindGettersToState(state.team, TeamGetter)
}))(ViolationHandler);

class ViolationDetailHandler extends React.Component {
    constructor() {
        super();
    }

    render() {
        return <ViolationDetail
                    violationId={this.props.params.violationId}
                    fullstopActions={FULLSTOP_ACTIONS}
                    {...this.props} />;
    }

}
ViolationDetailHandler.fetchData = function (routerState, state) {
    FULLSTOP_ACTIONS.fetchViolation(routerState.params.violationId);
    TEAM_ACTIONS.fetchAccounts();
    return requireAccounts(state, USER_ACTIONS);
};
ViolationDetailHandler.displayName = 'ViolationDetailHandler';
ViolationDetailHandler.propTypes = {
    params: React.PropTypes.object.isRequired
};
let ConnectedViolationDetailHandler = connect(state => ({
    userStore: bindGettersToState(state.user, UserGetter),
    fullstopStore: bindGettersToState(state.fullstop, FullstopGetter)
}))(ViolationDetailHandler);


class ViolationShortUrlHandler extends React.Component {
    constructor(props, context) {
        super();
        context.router.transitionTo('violation', null, JSON.parse(lzw.decompressFromEncodedURIComponent(props.params.shortened)));
    }

    render() {
        return <div><Icon name='circle-o-notch' spin /> Redirecting...</div>;
    }
}
ViolationShortUrlHandler.displayName = 'ViolationShortUrlHandler';
ViolationShortUrlHandler.propTypes = {
    params: React.PropTypes.object.isRequired
};
ViolationShortUrlHandler.contextTypes = {
    router: React.PropTypes.func.isRequired
};

const ROUTES =
    <Route name='violation' path='violation'>
        <DefaultRoute handler={ConnectedViolationHandler} />
        <Route name='violation-short' path='v/:shortened' handler={ViolationShortUrlHandler} />
        <Route name='violation-vioDetail' path=':violationId' handler={ConnectedViolationDetailHandler} />
    </Route>;

export default ROUTES;
