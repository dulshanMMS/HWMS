"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFetchUserGlobalPreferences = void 0;
const react_query_1 = require("@tanstack/react-query");
const useFetchUserGlobalPreferencesQueryKey_1 = require("./useFetchUserGlobalPreferencesQueryKey");
const useNovuContext_1 = require("./useNovuContext");
const useFetchUserGlobalPreferences = (options = {}) => {
    const { apiService, isSessionInitialized, fetchingStrategy } = (0, useNovuContext_1.useNovuContext)();
    const userGlobalPreferencesQueryKey = (0, useFetchUserGlobalPreferencesQueryKey_1.useFetchUserGlobalPreferencesQueryKey)();
    const result = (0, react_query_1.useQuery)(userGlobalPreferencesQueryKey, () => apiService.getUserGlobalPreference(), Object.assign(Object.assign({}, options), { enabled: isSessionInitialized && fetchingStrategy.fetchUserGlobalPreferences }));
    return result;
};
exports.useFetchUserGlobalPreferences = useFetchUserGlobalPreferences;
//# sourceMappingURL=useFetchUserGlobalPreferences.js.map