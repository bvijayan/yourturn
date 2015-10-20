import React from 'react';
import 'common/asset/less/yourturn/notification-bar.less';

class Notification extends React.Component {
    constructor() {
        super();
    }

    render() {
        return <li
                onClick={this.props.onClick}
                className={'type-' + (this.props.type || 'default')}>{this.props.message}</li>;
    }
}
Notification.propTypes = {
    type: React.PropTypes.string,
    onClick: React.PropTypes.func.isRequired,
    message: React.PropTypes.string.isRequired
};
Notification.displayName = 'Notification';


class NotificationBar extends React.Component {
    constructor(props) {
        super();
        this.store = props.notificationStore;
        this.actions = props.notificationActions;
    }

    dismiss(id) {
        this.actions.removeNotification(id);
    }

    render() {
        let notifications = this.store.getNotifications();
        if (notifications.length) {
            return <div className='notificationBar'>
                        <ul>
                            {notifications.map(
                                n => <Notification
                                        onClick={this.dismiss.bind(this, n.id)}
                                        key={n.id}
                                        type={n.type}
                                        message={n.message} />
                            )}
                        </ul>
                    </div>;
        }
        return null;
    }
}
NotificationBar.displayName = 'NotificationBar';

export default NotificationBar;