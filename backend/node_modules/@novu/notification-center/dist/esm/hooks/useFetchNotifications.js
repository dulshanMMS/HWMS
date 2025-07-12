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
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNovuContext } from './useNovuContext';
import { getNextPageParam } from '../utils/pagination';
import { useFetchNotificationsQueryKey } from './useFetchNotificationsQueryKey';
export const useFetchNotifications = ({ query } = {}, options = {}) => {
    const { apiService, isSessionInitialized, fetchingStrategy } = useNovuContext();
    const fetchNotificationsQueryKey = useFetchNotificationsQueryKey();
    const result = useInfiniteQuery(fetchNotificationsQueryKey, ({ pageParam = 0 }) => apiService.getNotificationsList(pageParam, query), Object.assign(Object.assign({}, options), { enabled: isSessionInitialized && fetchingStrategy.fetchNotifications, getNextPageParam }));
    const refetch = (_a = {}) => {
        var { page } = _a, otherOptions = __rest(_a, ["page"]);
        if (page !== undefined) {
            result.fetchNextPage(Object.assign({ pageParam: page }, otherOptions));
        }
        else {
            result.refetch(otherOptions);
        }
    };
    return Object.assign(Object.assign({}, result), { refetch });
};
//# sourceMappingURL=useFetchNotifications.js.map