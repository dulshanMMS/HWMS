"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFetchOrganization = void 0;
const react_query_1 = require("@tanstack/react-query");
const useNovuContext_1 = require("./useNovuContext");
const queryKeys_1 = require("./queryKeys");
const useSetQueryKey_1 = require("./useSetQueryKey");
const useFetchOrganization = (options = {}) => {
    const { apiService, isSessionInitialized, fetchingStrategy } = (0, useNovuContext_1.useNovuContext)();
    const setQueryKey = (0, useSetQueryKey_1.useSetQueryKey)();
    const result = (0, react_query_1.useQuery)(setQueryKey(queryKeys_1.ORGANIZATION_QUERY_KEY), () => apiService.getOrganization(), Object.assign(Object.assign({}, options), { enabled: isSessionInitialized && fetchingStrategy.fetchOrganization }));
    return result;
};
exports.useFetchOrganization = useFetchOrganization;
//# sourceMappingURL=useFetchOrganization.js.map