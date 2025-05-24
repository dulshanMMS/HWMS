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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUnreadCount = void 0;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const lodash_debounce_1 = __importDefault(require("lodash.debounce"));
const shared_1 = require("@novu/shared");
const useNovuContext_1 = require("./useNovuContext");
const useSetQueryKey_1 = require("./useSetQueryKey");
const useFetchNotificationsQueryKey_1 = require("./useFetchNotificationsQueryKey");
const useUnseenCountQueryKey_1 = require("./useUnseenCountQueryKey");
const useDataRef_1 = require("./useDataRef");
const queryKeys_1 = require("./queryKeys");
const useUnreadCountQueryKey_1 = require("./useUnreadCountQueryKey");
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
const useUnreadCount = (_a = {}) => {
    var { onSuccess } = _a, restOptions = __rest(_a, ["onSuccess"]);
    const { apiService, socket, isSessionInitialized, fetchingStrategy } = (0, useNovuContext_1.useNovuContext)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const setQueryKey = (0, useSetQueryKey_1.useSetQueryKey)();
    const fetchNotificationsQueryKey = (0, useFetchNotificationsQueryKey_1.useFetchNotificationsQueryKey)();
    const unreadCountQueryKey = (0, useUnreadCountQueryKey_1.useUnreadCountQueryKey)();
    const unseenCountQueryKey = (0, useUnseenCountQueryKey_1.useUnseenCountQueryKey)();
    const queryKeysRef = (0, useDataRef_1.useDataRef)({ fetchNotificationsQueryKey, unreadCountQueryKey, unseenCountQueryKey });
    (0, react_1.useEffect)(() => {
        if (!socket) {
            return () => { };
        }
        socket.on(shared_1.WebSocketEventEnum.UNREAD, (0, lodash_debounce_1.default)((data) => {
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
                queryClient.refetchQueries([...queryKeys_1.FEED_UNSEEN_COUNT_QUERY_KEY], {
                    exact: false,
                });
                dispatchUnreadCountEvent(data.unreadCount);
            }
        }, DEBOUNCE_TIME));
        return () => {
            socket.off(shared_1.WebSocketEventEnum.UNREAD);
        };
    }, [socket, queryClient, setQueryKey]);
    const result = (0, react_query_1.useQuery)(unreadCountQueryKey, () => apiService.getUnreadCount({ limit: 100 }), Object.assign(Object.assign({}, restOptions), { enabled: isSessionInitialized && fetchingStrategy.fetchUnreadCount, onSuccess: (data) => {
            dispatchUnreadCountEvent(data.count);
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data);
        } }));
    return result;
};
exports.useUnreadCount = useUnreadCount;
//# sourceMappingURL=useUnreadCount.js.map