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
const dispatchUnseenCountEvent = (count) => {
    document.dispatchEvent(new CustomEvent('novu:unseen_count_changed', { detail: count }));
};
const DEBOUNCE_TIME = 100;
export const useUnseenCount = (_a = {}) => {
    var { onSuccess } = _a, restOptions = __rest(_a, ["onSuccess"]);
    const { apiService, socket, isSessionInitialized, fetchingStrategy } = useNovuContext();
    const queryClient = useQueryClient();
    const setQueryKey = useSetQueryKey();
    const fetchNotificationsQueryKey = useFetchNotificationsQueryKey();
    const unseenCountQueryKey = useUnseenCountQueryKey();
    const queryKeysRef = useDataRef({ fetchNotificationsQueryKey, unseenCountQueryKey });
    useEffect(() => {
        if (!socket) {
            return () => { };
        }
        socket.on(WebSocketEventEnum.UNSEEN, debounce((data) => {
            if (Number.isInteger(data === null || data === void 0 ? void 0 : data.unseenCount)) {
                queryClient.setQueryData(unseenCountQueryKey, (oldData) => {
                    var _a;
                    return ({
                        count: (_a = data === null || data === void 0 ? void 0 : data.unseenCount) !== null && _a !== void 0 ? _a : oldData.count,
                    });
                });
                queryClient.refetchQueries(queryKeysRef.current.fetchNotificationsQueryKey, {
                    exact: false,
                });
                // refetch all feeds unseen count that is shown on the tabs
                queryClient.refetchQueries([...FEED_UNSEEN_COUNT_QUERY_KEY], {
                    exact: false,
                });
                dispatchUnseenCountEvent(data.unseenCount);
            }
        }, DEBOUNCE_TIME));
        return () => {
            socket.off(WebSocketEventEnum.UNSEEN);
        };
    }, [socket, queryClient, setQueryKey]);
    const result = useQuery(unseenCountQueryKey, () => apiService.getUnseenCount({ limit: 100 }), Object.assign(Object.assign({}, restOptions), { enabled: isSessionInitialized && fetchingStrategy.fetchUnseenCount, onSuccess: (data) => {
            dispatchUnseenCountEvent(data.count);
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data);
        } }));
    return result;
};
//# sourceMappingURL=useUnseenCount.js.map