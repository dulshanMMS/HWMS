"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFetchUserPreferencesQueryKey = void 0;
const react_1 = require("react");
const queryKeys_1 = require("./queryKeys");
const useSetQueryKey_1 = require("./useSetQueryKey");
const useFetchUserPreferencesQueryKey = () => {
    const setQueryKey = (0, useSetQueryKey_1.useSetQueryKey)();
    const queryKey = (0, react_1.useMemo)(() => setQueryKey([...queryKeys_1.USER_PREFERENCES_QUERY_KEY]), [setQueryKey]);
    return queryKey;
};
exports.useFetchUserPreferencesQueryKey = useFetchUserPreferencesQueryKey;
//# sourceMappingURL=useFetchUserPreferencesQueryKey.js.map