"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsProvider = void 0;
const react_1 = __importStar(require("react"));
const notifications_context_1 = require("./notifications.context");
const hooks_1 = require("../hooks");
const hooks_2 = require("../hooks");
const useMarkNotificationAsRead_1 = require("../hooks/useMarkNotificationAsRead");
const useMarkNotificationAsSeen_1 = require("../hooks/useMarkNotificationAsSeen");
const useStore_1 = require("../hooks/useStore");
const store_provider_context_1 = require("./store-provider.context");
const useRemoveNotifications_1 = require("../hooks/useRemoveNotifications");
const DEFAULT_STORES = [{ storeId: 'default_store' }];
function NotificationsProvider({ children, stores = DEFAULT_STORES, }) {
    return (react_1.default.createElement(store_provider_context_1.StoreProvider, { stores: stores },
        react_1.default.createElement(NotificationsProviderInternal, null, children)));
}
exports.NotificationsProvider = NotificationsProvider;
function NotificationsProviderInternal({ children }) {
    const { storeQuery, storeId, stores, setStore } = (0, useStore_1.useStore)();
    const { data: notificationsPages, hasNextPage, isLoading, isFetching, isFetchingNextPage, fetchNextPage, refetch, } = (0, hooks_1.useFetchNotifications)({ query: storeQuery });
    const { data: unseenCountData } = (0, hooks_1.useUnseenCount)();
    const { data: unreadCountData } = (0, hooks_1.useUnreadCount)();
    const { markNotificationsAs } = (0, hooks_2.useMarkNotificationsAs)();
    const { removeNotification } = (0, hooks_1.useRemoveNotification)();
    const { removeNotifications } = (0, useRemoveNotifications_1.useRemoveNotifications)();
    const { removeAllNotifications } = (0, hooks_1.useRemoveAllNotifications)();
    const { markNotificationsAsRead } = (0, useMarkNotificationAsRead_1.useMarkNotificationsAsRead)();
    const { markNotificationsAsSeen } = (0, useMarkNotificationAsSeen_1.useMarkNotificationsAsSeen)();
    const markNotificationAsRead = (0, react_1.useCallback)((messageId) => markNotificationsAs({ messageId, seen: true, read: true }), [markNotificationsAs]);
    const markNotificationAsUnRead = (0, react_1.useCallback)((messageId) => markNotificationsAs({ messageId, seen: true, read: false }), [markNotificationsAs]);
    const removeMessage = (0, react_1.useCallback)((messageId) => removeNotification({ messageId }), [removeNotification]);
    const removeMessages = (0, react_1.useCallback)((messageIds) => removeNotifications({ messageIds }), [removeNotifications]);
    const removeAllMessages = (0, react_1.useCallback)((feedId) => removeAllNotifications({ feedId }), [removeAllNotifications]);
    const markAllNotificationsAsRead = (0, react_1.useCallback)(() => {
        markNotificationsAsRead({ feedId: storeQuery === null || storeQuery === void 0 ? void 0 : storeQuery.feedIdentifier });
    }, [markNotificationsAsRead, storeQuery === null || storeQuery === void 0 ? void 0 : storeQuery.feedIdentifier]);
    const markAllNotificationsAsSeen = (0, react_1.useCallback)(() => {
        markNotificationsAsSeen({ feedId: storeQuery === null || storeQuery === void 0 ? void 0 : storeQuery.feedIdentifier });
    }, [markNotificationsAsSeen, storeQuery === null || storeQuery === void 0 ? void 0 : storeQuery.feedIdentifier]);
    const markNotificationAsSeen = (0, react_1.useCallback)((messageId) => markNotificationsAs({ messageId, seen: true, read: false }), [markNotificationsAs]);
    const markFetchedNotificationsAsRead = (0, react_1.useCallback)(() => {
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
    const markFetchedNotificationsAsSeen = (0, react_1.useCallback)(() => {
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
    const notifications = (0, react_1.useMemo)(() => notificationsPages === null || notificationsPages === void 0 ? void 0 : notificationsPages.pages.reduce((acc, paginatedResponse) => [...acc, ...paginatedResponse.data], []), [notificationsPages]);
    const contextValue = (0, react_1.useMemo)(() => {
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
    return react_1.default.createElement(notifications_context_1.NotificationsContext.Provider, { value: contextValue }, children);
}
//# sourceMappingURL=notifications-provider.context.js.map