"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUnseenCountQueryKey = void 0;
const react_1 = require("react");
const queryKeys_1 = require("./queryKeys");
const useSetQueryKey_1 = require("./useSetQueryKey");
const useStore_1 = require("./useStore");
const useUnseenCountQueryKey = () => {
    const { storeQuery } = (0, useStore_1.useStore)();
    const setQueryKey = (0, useSetQueryKey_1.useSetQueryKey)();
    const queryKey = (0, react_1.useMemo)(() => setQueryKey([...queryKeys_1.UNSEEN_COUNT_QUERY_KEY, storeQuery]), [setQueryKey, storeQuery]);
    return queryKey;
};
exports.useUnseenCountQueryKey = useUnseenCountQueryKey;
//# sourceMappingURL=useUnseenCountQueryKey.js.map