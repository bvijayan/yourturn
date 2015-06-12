import {Store} from 'flummox';
import _m from 'mori';
import _ from 'lodash';

class FullstopStore extends Store {
    constructor(flux) {
        super();

        const fullstopActions = flux.getActions('fullstop');

        this.state = {
            violations: _m.vector()
        };

        this.registerAsync(
            fullstopActions.fetchViolations,
            this.beginFetchViolations,
            this.receiveViolations,
            this.failFetchViolations);

        this.registerAsync(
            fullstopActions.resolveViolation,
            this.beginFetchViolation,
            this.receiveViolation,
            this.failFetchViolation);
    }

    beginFetchViolations() { }
    failFetchViolations() { }
    beginFetchViolation() { }
    failFetchViolation() { }

    receiveViolation(violation) {
        // check if we have this violation already
        let coll = this.state.violations,
            exists = _m.empty(_m.filter(v => _m.get(v, 'id') === violation.id, coll));
        if (exists) {
            // if we do, remove the old one
            coll = _m.filter(v => _m.get(v, 'id') !== violation.id, coll);
        }
        // if not, just add it
        coll = _m.conj(coll, _m.toClj(violation));
        this.setState({
            violations: coll
        });
    }

    receiveViolations(violations) {
        let all = _m.toJs(_m.into(this.state.violations, _m.toClj(violations)));
        // sorry, with mori there always was an infinite loop
        all = all
                .reverse()
                .filter((v, i, array) => _.findLastIndex(array, a => a.id === v.id) === i);

        this.setState({
            violations: _m.toClj(all)
        });
    }

    getViolation(violationId) {
        let coll = this.state.violations;
        return _m.toJs(_m.first(_m.filter(v => _m.get(v, 'id') === violationId, coll)));
    }

    getViolations(accounts, resolved) {
        let violations = _m.filter(v => accounts ?
                                            accounts.indexOf(_m.get(v, 'account_id')) >= 0 :
                                            true,
                                        this.state.violations);
        if (resolved !== undefined) {
            violations = _m.filter(v => !!_m.get(v, 'comment') === resolved, violations);
        }
        violations = _m.sortBy(v => _m.get(v, 'created'), violations);
        return _m.toJs(violations);
    }

    _empty() {
        this.setState({
            violations: _m.vector()
        });
    }
}

export default FullstopStore;