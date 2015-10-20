import React from 'react';
import Icon from 'react-fa';
import _ from 'lodash';
import {Services} from 'common/src/data/services';
import 'common/asset/less/yourturn/search.less';

class Search extends React.Component {
    constructor(props) {
        super();
        this.stores = {
            search: props.searchStore
        };
        this.actions = props.searchActions;
        this.state = {
            term: ''
        };
    }

    updateTerm(evt) {
        this.setState({
            term: evt.target.value
        });
    }

    search() {
        let {term} = this.state;
        if (!term.length) {
            this.actions.clearSearchResults(term);
        } else {
            if (this.stores.search.hasResults(term)) {
                this.actions.clearSearchResults(term);
            }
            Object
                .keys(Services)
                .filter(key => !!Services[key].searchQuery)
                .forEach(key => this.actions.fetchSearchResultsFrom(key, term));
        }
    }

    componentWillMount() {
        this._debouncedSearch = _.debounce(this.search, 150);
    }

    render() {
        let {term} = this.state,
            results = this.stores.search.getSearchResults(term);

        return <div className='search'>
                    <h2>Search</h2>

                    <div className='form'>
                        <div className='input-group'>
                            <div className='input-addon'>
                                <Icon name='search' />
                            </div>
                            <input
                                autoFocus='autofocus'
                                value={term}
                                onChange={this.updateTerm.bind(this)}
                                onKeyUp={this._debouncedSearch.bind(this)}
                                type='search'
                                aria-label='Enter your search'
                                placeholder='yourturn' />
                        </div>
                    </div>

                    {term.length ?
                        (results.length ?
                            <div>
                                <h4 className='searchResult-headline'>Results for “{term}”</h4>
                                <ol>
                                    {results.map(
                                        (result, i) => <li key={i}>
                                                        {result._url ?
                                                            <a href={result._url}>{result.name}</a>
                                                            :
                                                            result.name} <small>({result._source})</small>
                                                        </li>)}
                                </ol>
                            </div>
                            :
                            <h4 className='searchResult-headline'>No results for “{term}”</h4>)
                        :
                        null}
                </div>;
    }
}
Search.displayName = 'Search';

export default Search;