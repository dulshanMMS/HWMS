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
exports.useUnseenCount = void 0;
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
const dispatchUnseenCountEvent = (count) => {
    document.dispatchEvent(new CustomEvent('novu:unseen_count_changed', { detail: count }));
};
const DEBOUNCE_TIME = 100;
const useUnseenCount = (_a = {}) => {
    var { onSuccess } = _a, restOptions = __rest(_a, ["onSuccess"]);
    const { apiService, socket, isSessionInitialized, fetchingStrategy } = (0, useNovuContext_1.useNovuContext)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const setQueryKey = (0, useSetQueryKey_1.useSetQueryKey)();
    const fetchNotificationsQueryKey = (0, useFetchNotificationsQueryKey_1.useFetchNotificationsQueryKey)();
    const unseenCountQueryKey = (0, useUnseenCountQueryKey_1.useUnseenCountQueryKey)();
    const queryKeysRef = (0, useDataRef_1.useDataRef)({ fetchNotificationsQueryKey, unseenCountQueryKey });
    (0, react_1.useEffect)(() => {
        if (!socket) {
            return () => { };
        }
        socket.on(shared_1.WebSocketEventEnum.UNSEEN, (0, lodash_debounce_1.default)((data) => {
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
                queryClient.refetchQueries([...queryKeys_1.FEED_UNSEEN_COUNT_QUERY_KEY], {
                    exact: false,
                });
                dispatchUnseenCountEvent(data.unseenCount);
            }
        }, DEBOUNCE_TIME));
        return () => {
            socket.off(shared_1.WebSocketEventEnum.UNSEEN);
        };
    }, [socket, queryClient, setQueryKey]);
    const result = (0, react_query_1.useQuery)(unseenCountQueryKey, () => apiService.getUnseenCount({ limit: 100 }), Object.assign(Object.assign({}, restOptions), { enabled: isSessionInitialized && fetchingStrategy.fetchUnseenCount, onSuccess: (data) => {
            dispatchUnseenCountEvent(data.count);
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data);
        } }));
    return result;
};
exports.useUnseenCount = useUnseenCount;
//# sourceMappingURL=useUnseenCount.js.map