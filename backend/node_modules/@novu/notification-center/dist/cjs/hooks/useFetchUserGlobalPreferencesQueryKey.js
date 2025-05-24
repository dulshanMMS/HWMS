"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFetchUserGlobalPreferencesQueryKey = void 0;
const react_1 = require("react");
const queryKeys_1 = require("./queryKeys");
const useSetQueryKey_1 = require("./useSetQueryKey");
const useFetchUserGlobalPreferencesQueryKey = () => {
    const setQueryKey = (0, useSetQueryKey_1.useSetQueryKey)();
    const queryKey = (0, react_1.useMemo)(() => setQueryKey([...queryKeys_1.USER_GLOBAL_PREFERENCES_QUERY_KEY]), [setQueryKey]);
    return queryKey;
};
exports.useFetchUserGlobalPreferencesQueryKey = useFetchUserGlobalPreferencesQueryKey;
//# sourceMappingURL=useFetchUserGlobalPreferencesQueryKey.js.map