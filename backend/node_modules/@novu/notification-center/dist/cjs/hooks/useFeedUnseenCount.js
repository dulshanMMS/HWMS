"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFeedUnseenCount = void 0;
const react_query_1 = require("@tanstack/react-query");
const useNovuContext_1 = require("./useNovuContext");
const useFeedUnseenCountQueryKey_1 = require("./useFeedUnseenCountQueryKey");
const useFeedUnseenCount = ({ query }, options = {}) => {
    const { apiService, isSessionInitialized } = (0, useNovuContext_1.useNovuContext)();
    const feedUnseenCountQueryKey = (0, useFeedUnseenCountQueryKey_1.useFeedUnseenCountQueryKey)(query);
    const result = (0, react_query_1.useQuery)(feedUnseenCountQueryKey, () => apiService.getTabCount(query), Object.assign(Object.assign({}, options), { enabled: isSessionInitialized }));
    return result;
};
exports.useFeedUnseenCount = useFeedUnseenCount;
//# sourceMappingURL=useFeedUnseenCount.js.map