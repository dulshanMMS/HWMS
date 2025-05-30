import React from 'react';
import { cx, css } from '@emotion/css';
import InfiniteScroll from 'react-infinite-scroll-component';
import { NotificationListItem } from './notification-item/NotificationListItem';
import { Loader } from './Loader';
import { useStyles } from '../../../store/styles';
export function NotificationsList({ notifications, onFetch, hasNextPage, onNotificationClicked, }) {
    const totalCount = notifications === null || notifications === void 0 ? void 0 : notifications.length;
    const [notificationsListStyles] = useStyles('notifications.root');
    return (React.createElement("div", { className: cx('nc-notifications-list', notificationsListCss, css(notificationsListStyles)), id: "notifications-list", "data-test-id": "notifications-scroll-area" },
        React.createElement(InfiniteScroll, { dataLength: totalCount, next: onFetch, hasMore: hasNextPage, loader: React.createElement(Loader, null), endMessage: false, scrollableTarget: "notifications-list" }, notifications.map((notification) => {
            return (React.createElement(NotificationListItem, { key: notification._id, notification: notification, onClick: onNotificationClicked }));
        }))));
}
const notificationsListCss = css `
  height: 400px;
  overflow-y: auto;
`;
//# sourceMappingURL=NotificationsList.js.map