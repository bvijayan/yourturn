import React from 'react';
import Icon from 'react-fa';
import {Link} from 'react-router';
import 'common/asset/less/resource/resource-list.less';

class ResourceList extends React.Component {
    constructor(props) {
        super();
        this.stores = {
            essentials: props.flux.getStore('essentials'),
            user: props.globalFlux.getStore('user')
        };
        this.state = {
            term: ''
        };
        this._forceUpdate = this.forceUpdate.bind(this);
        this.stores.user.on('change', this._forceUpdate);
    }

    componentWillUnmount() {
        this.stores.user.off('change', this._forceUpdate);
    }

    filter(evt) {
        this.setState({
            term: evt.target.value
        });
    }

    render() {
        let {essentials, user} = this.stores,
            {term} = this.state,
            whitelisted = user.isWhitelisted(),
            resources = essentials.getResources(term);
        return <div className='resourceList'>
                    <h2>Resource Types</h2>
                    <div className='u-info'>
                        <div>
                            An example of a resource is <em>one</em> sales order of a customer. The resource type of it would be <em>“sales order”</em>. Another example for resource types is <em>“customer information”</em> where the resource would be the master data of <em>one</em> customer.
                        </div>
                    </div>
                    <div className='btn-group'>
                        <Link
                            to='resource-resCreate'
                            className={`btn btn-primary ${whitelisted ? '' : 'btn-disabled'}`}>
                            <Icon name='plus' /> Create Resource Type
                        </Link>
                    </div>
                    <div className='form-group'>
                        <form className='form'>
                            <label htmlFor='yourturn-search'>Search:</label>
                            <div className='input-group'>
                                <div className='input-addon'>
                                    <Icon name='search' />
                                </div>
                                <input
                                    name='yourturn_search'
                                    autoFocus='autofocus'
                                    value={term}
                                    onChange={this.filter.bind(this)}
                                    type='search'
                                    aria-label='Enter your term'
                                    placeholder='Sales Order' />
                            </div>
                        </form>
                    </div>
                    {resources.length ?
                        <ul data-block='resources'>
                            {resources.map(
                                res =>
                                    <li key={res.id}>
                                        <Link
                                            to='resource-resDetail'
                                            params={{
                                                resourceId: res.id
                                            }}>
                                            {res.name}
                                        </Link>
                                    </li>)}
                        </ul>
                        :
                        <span>No Resource Types.</span>}
                </div>;
    }
}
ResourceList.displayName = 'ResourceList';
export default ResourceList;