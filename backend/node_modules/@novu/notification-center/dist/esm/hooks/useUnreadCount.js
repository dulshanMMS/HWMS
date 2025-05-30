var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import { WebSocketEventEnum } from '@novu/shared';
import { useNovuContext } from './useNovuContext';
import { useSetQueryKey } from './useSetQueryKey';
import { useFetchNotificationsQueryKey } from './useFetchNotificationsQueryKey';
import { useUnseenCountQueryKey } from './useUnseenCountQueryKey';
import { useDataRef } from './useDataRef';
import { FEED_UNSEEN_COUNT_QUERY_KEY } from './queryKeys';
import { useUnreadCountQueryKey } from './useUnreadCountQueryKey';
const dispatchUnreadCountEvent = (count) => {
    document.dispatchEvent(new CustomEvent('novu:unread_count_changed', { detail: count }));
};
/**
 * TODO: This is a temporary fix
 * Cypress is slow, so we need to increase the debounce time
 * This is happening in a very high thruput of updates in testing env.
 *
 * Can also happen in real scenarios, so we need to review how we handle concurrency in the future
 */
const DEBOUNCE_TIME = 100;
export const useUnreadCount = (_a = {}) => {
    var { onSuccess } = _a, restOptions = __rest(_a, ["onSuccess"]);
    const { apiService, socket, isSessionInitialized, fetchingStrategy } = useNovuContext();
    const queryClient = useQueryClient();
    const setQueryKey = useSetQueryKey();
    const fetchNotificationsQueryKey = useFetchNotificationsQueryKey();
    const unreadCountQueryKey = useUnreadCountQueryKey();
    const unseenCountQueryKey = useUnseenCountQueryKey();
    const queryKeysRef = useDataRef({ fetchNotificationsQueryKey, unreadCountQueryKey, unseenCountQueryKey });
    useEffect(() => {
        if (!socket) {
            return () => { };
        }
        socket.on(WebSocketEventEnum.UNREAD, debounce((data) => {
            if (Number.isInteger(data === null || data === void 0 ? void 0 : data.unreadCount)) {
                queryClient.setQueryData(queryKeysRef.current.unreadCountQueryKey, (oldData) => {
                    var _a;
                    return ({
                        count: (_a = data === null || data === void 0 ? void 0 : data.unreadCount) !== null && _a !== void 0 ? _a : oldData.count,
                    });
                });
                // when unread count changes, we need to refetch unseen count
                queryClient.refetchQueries(queryKeysRef.current.unseenCountQueryKey, {
                    exact: false,
                });
                queryClient.refetchQueries(queryKeysRef.current.fetchNotificationsQueryKey, {
                    exact: false,
                });
                // refetch all feeds unseen count that is shown on the tabs
                queryClient.refetchQueries([...FEED_UNSEEN_COUNT_QUERY_KEY], {
                    exact: false,
                });
                dispatchUnreadCountEvent(data.unreadCount);
            }
        }, DEBOUNCE_TIME));
        return () => {
            socket.off(WebSocketEventEnum.UNREAD);
        };
    }, [socket, queryClient, setQueryKey]);
    const result = useQuery(unreadCountQueryKey, () => apiService.getUnreadCount({ limit: 100 }), Object.assign(Object.assign({}, restOptions), { enabled: isSessionInitialized && fetchingStrategy.fetchUnreadCount, onSuccess: (data) => {
            dispatchUnreadCountEvent(data.count);
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data);
        } }));
    return result;
};
//# sourceMappingURL=useUnreadCount.js.map