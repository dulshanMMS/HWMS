"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFetchUserPreferences = void 0;
const react_query_1 = require("@tanstack/react-query");
const useNovuContext_1 = require("./useNovuContext");
const useFetchUserPreferencesQueryKey_1 = require("./useFetchUserPreferencesQueryKey");
const useFetchUserPreferences = (options = {}) => {
    const { apiService, isSessionInitialized, fetchingStrategy } = (0, useNovuContext_1.useNovuContext)();
    const userPreferencesQueryKey = (0, useFetchUserPreferencesQueryKey_1.useFetchUserPreferencesQueryKey)();
    const result = (0, react_query_1.useQuery)(userPreferencesQueryKey, () => apiService.getUserPreference(), Object.assign(Object.assign({}, options), { enabled: isSessionInitialized && fetchingStrategy.fetchUserPreferences }));
    return result;
};
exports.useFetchUserPreferences = useFetchUserPreferences;
//# sourceMappingURL=useFetchUserPreferences.js.map