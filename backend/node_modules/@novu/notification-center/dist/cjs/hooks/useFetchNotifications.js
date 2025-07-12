"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFetchNotifications = void 0;
const react_query_1 = require("@tanstack/react-query");
const useNovuContext_1 = require("./useNovuContext");
const pagination_1 = require("../utils/pagination");
const useFetchNotificationsQueryKey_1 = require("./useFetchNotificationsQueryKey");
const useFetchNotifications = ({ query } = {}, options = {}) => {
    const { apiService, isSessionInitialized, fetchingStrategy } = (0, useNovuContext_1.useNovuContext)();
    const fetchNotificationsQueryKey = (0, useFetchNotificationsQueryKey_1.useFetchNotificationsQueryKey)();
    const result = (0, react_query_1.useInfiniteQuery)(fetchNotificationsQueryKey, ({ pageParam = 0 }) => apiService.getNotificationsList(pageParam, query), Object.assign(Object.assign({}, options), { enabled: isSessionInitialized && fetchingStrategy.fetchNotifications, getNextPageParam: pagination_1.getNextPageParam }));
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
exports.useFetchNotifications = useFetchNotifications;
//# sourceMappingURL=useFetchNotifications.js.map