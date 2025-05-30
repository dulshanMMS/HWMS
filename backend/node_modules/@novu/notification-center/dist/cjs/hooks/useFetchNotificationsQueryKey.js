"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFetchNotificationsQueryKey = void 0;
const react_1 = require("react");
const queryKeys_1 = require("./queryKeys");
const useSetQueryKey_1 = require("./useSetQueryKey");
const useStore_1 = require("./useStore");
const useFetchNotificationsQueryKey = () => {
    const { storeQuery } = (0, useStore_1.useStore)();
    const setQueryKey = (0, useSetQueryKey_1.useSetQueryKey)();
    const queryKey = (0, react_1.useMemo)(() => setQueryKey([...queryKeys_1.INFINITE_NOTIFICATIONS_QUERY_KEY, storeQuery]), [setQueryKey, storeQuery]);
    return queryKey;
};
exports.useFetchNotificationsQueryKey = useFetchNotificationsQueryKey;
//# sourceMappingURL=useFetchNotificationsQueryKey.js.map