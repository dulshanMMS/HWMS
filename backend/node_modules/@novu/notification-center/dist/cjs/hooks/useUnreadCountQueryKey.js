"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUnreadCountQueryKey = void 0;
const react_1 = require("react");
const queryKeys_1 = require("./queryKeys");
const useSetQueryKey_1 = require("./useSetQueryKey");
const useStore_1 = require("./useStore");
const useUnreadCountQueryKey = () => {
    const { storeQuery } = (0, useStore_1.useStore)();
    const setQueryKey = (0, useSetQueryKey_1.useSetQueryKey)();
    const queryKey = (0, react_1.useMemo)(() => setQueryKey([...queryKeys_1.UNREAD_COUNT_QUERY_KEY, storeQuery]), [setQueryKey, storeQuery]);
    return queryKey;
};
exports.useUnreadCountQueryKey = useUnreadCountQueryKey;
//# sourceMappingURL=useUnreadCountQueryKey.js.map