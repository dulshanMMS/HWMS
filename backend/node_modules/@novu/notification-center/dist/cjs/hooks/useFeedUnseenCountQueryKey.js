"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFeedUnseenCountQueryKey = void 0;
const react_1 = require("react");
const queryKeys_1 = require("./queryKeys");
const useSetQueryKey_1 = require("./useSetQueryKey");
const useFeedUnseenCountQueryKey = (query) => {
    const setQueryKey = (0, useSetQueryKey_1.useSetQueryKey)();
    const queryKey = (0, react_1.useMemo)(() => setQueryKey([...queryKeys_1.FEED_UNSEEN_COUNT_QUERY_KEY, query]), [setQueryKey, query]);
    return queryKey;
};
exports.useFeedUnseenCountQueryKey = useFeedUnseenCountQueryKey;
//# sourceMappingURL=useFeedUnseenCountQueryKey.js.map