import React, { useCallback, useMemo } from 'react';
import { NotificationsContext } from './notifications.context';
import { useFetchNotifications, useRemoveNotification, useRemoveAllNotifications, useUnseenCount, useUnreadCount, } from '../hooks';
import { useMarkNotificationsAs } from '../hooks';
import { useMarkNotificationsAsRead } from '../hooks/useMarkNotificationAsRead';
import { useMarkNotificationsAsSeen } from '../hooks/useMarkNotificationAsSeen';
import { useStore } from '../hooks/useStore';
import { StoreProvider } from './store-provider.context';
import { useRemoveNotifications } from '../hooks/useRemoveNotifications';
const DEFAULT_STORES = [{ storeId: 'default_store' }];
export function NotificationsProvider({ children, stores = DEFAULT_STORES, }) {
    return (React.createElement(StoreProvider, { stores: stores },
        React.createElement(NotificationsProviderInternal, null, children)));
}
function NotificationsProviderInternal({ children }) {
    const { storeQuery, storeId, stores, setStore } = useStore();
    const { data: notificationsPages, hasNextPage, isLoading, isFetching, isFetchingNextPage, fetchNextPage, refetch, } = useFetchNotifications({ query: storeQuery });
    const { data: unseenCountData } = useUnseenCount();
    const { data: unreadCountData } = useUnreadCount();
    const { markNotificationsAs } = useMarkNotificationsAs();
    const { removeNotification } = useRemoveNotification();
    const { removeNotifications } = useRemoveNotifications();
    const { removeAllNotifications } = useRemoveAllNotifications();
    const { markNotificationsAsRead } = useMarkNotificationsAsRead();
    const { markNotificationsAsSeen } = useMarkNotificationsAsSeen();
    const markNotificationAsRead = useCallback((messageId) => markNotificationsAs({ messageId, seen: true, read: true }), [markNotificationsAs]);
    const markNotificationAsUnRead = useCallback((messageId) => markNotificationsAs({ messageId, seen: true, read: false }), [markNotificationsAs]);
    const removeMessage = useCallback((messageId) => removeNotification({ messageId }), [removeNotification]);
    const removeMessages = useCallback((messageIds) => removeNotifications({ messageIds }), [removeNotifications]);
    const removeAllMessages = useCallback((feedId) => removeAllNotifications({ feedId }), [removeAllNotifications]);
    const markAllNotificationsAsRead = useCallback(() => {
        markNotificationsAsRead({ feedId: storeQuery === null || storeQuery === void 0 ? void 0 : storeQuery.feedIdentifier });
    }, [markNotificationsAsRead, storeQuery === null || storeQuery === void 0 ? void 0 : storeQuery.feedIdentifier]);
    const markAllNotificationsAsSeen = useCallback(() => {
        markNotificationsAsSeen({ feedId: storeQuery === null || storeQuery === void 0 ? void 0 : storeQuery.feedIdentifier });
    }, [markNotificationsAsSeen, storeQuery === null || storeQuery === void 0 ? void 0 : storeQuery.feedIdentifier]);
    const markNotificationAsSeen = useCallback((messageId) => markNotificationsAs({ messageId, seen: true, read: false }), [markNotificationsAs]);
    const markFetchedNotificationsAsRead = useCallback(() => {
        if (!notificationsPages) {
            return;
        }
        const messageIds = notificationsPages.pages.reduce((acc, paginatedResponse) => {
            const pageMessageIds = paginatedResponse.data.filter((message) => !message.read).map((message) => message._id);
            return [...acc, ...pageMessageIds];
        }, []);
        if (messageIds.length > 0) {
            markNotificationsAs({ messageId: messageIds, seen: true, read: true });
        }
    }, [markNotificationsAs, notificationsPages]);
    const markFetchedNotificationsAsSeen = useCallback(() => {
        if (!notificationsPages) {
            return;
        }
        const messageIds = notificationsPages.pages.reduce((acc, paginatedResponse) => {
            const pageMessagesIds = paginatedResponse.data
                .filter((message) => !message.seen && !message.read)
                .map((message) => message._id);
            return [...acc, ...pageMessagesIds];
        }, []);
        if (messageIds.length > 0) {
            markNotificationsAs({ messageId: messageIds, seen: true, read: false });
        }
    }, [markNotificationsAs, notificationsPages]);
    const notifications = useMemo(() => notificationsPages === null || notificationsPages === void 0 ? void 0 : notificationsPages.pages.reduce((acc, paginatedResponse) => [...acc, ...paginatedResponse.data], []), [notificationsPages]);
    const contextValue = useMemo(() => {
        var _a, _b;
        return ({
            storeQuery,
            storeId,
            stores,
            unseenCount: (_a = unseenCountData === null || unseenCountData === void 0 ? void 0 : unseenCountData.count) !== null && _a !== void 0 ? _a : 0,
            unreadCount: (_b = unreadCountData === null || unreadCountData === void 0 ? void 0 : unreadCountData.count) !== null && _b !== void 0 ? _b : 0,
            notifications,
            hasNextPage,
            isLoading,
            isFetching,
            isFetchingNextPage,
            setStore,
            fetchNextPage,
            refetch,
            markNotificationAsSeen,
            markNotificationAsRead,
            markNotificationAsUnRead,
            markFetchedNotificationsAsRead,
            markFetchedNotificationsAsSeen,
            removeMessage,
            removeMessages,
            removeAllMessages,
            markAllNotificationsAsRead,
            markAllNotificationsAsSeen,
        });
    }, [
        storeQuery,
        storeId,
        stores,
        unseenCountData === null || unseenCountData === void 0 ? void 0 : unseenCountData.count,
        unreadCountData === null || unreadCountData === void 0 ? void 0 : unreadCountData.count,
        notifications,
        hasNextPage,
        isLoading,
        isFetching,
        isFetchingNextPage,
        setStore,
        fetchNextPage,
        refetch,
        markNotificationAsSeen,
        markNotificationAsRead,
        markNotificationAsUnRead,
        markFetchedNotificationsAsRead,
        markFetchedNotificationsAsSeen,
        removeMessage,
        removeMessages,
        removeAllMessages,
        markAllNotificationsAsRead,
        markAllNotificationsAsSeen,
    ]);
    return React.createElement(NotificationsContext.Provider, { value: contextValue }, children);
}
//# sourceMappingURL=notifications-provider.context.js.map