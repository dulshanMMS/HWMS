"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUpdateUserGlobalPreferences = void 0;
const react_query_1 = require("@tanstack/react-query");
const react_1 = require("react");
const useFetchUserGlobalPreferencesQueryKey_1 = require("./useFetchUserGlobalPreferencesQueryKey");
const useNovuContext_1 = require("./useNovuContext");
const useUpdateUserGlobalPreferences = (_a = {}) => {
    var { onSuccess, onError } = _a, options = __rest(_a, ["onSuccess", "onError"]);
    const queryClient = (0, react_query_1.useQueryClient)();
    const { apiService } = (0, useNovuContext_1.useNovuContext)();
    const userGlobalPreferencesQueryKey = (0, useFetchUserGlobalPreferencesQueryKey_1.useFetchUserGlobalPreferencesQueryKey)();
    const updateGlobalPreferenceChecked = (0, react_1.useCallback)(({ enabled, preferences }) => {
        queryClient.setQueryData(userGlobalPreferencesQueryKey, (old) => {
            return {
                preference: {
                    enabled: enabled !== null && enabled !== void 0 ? enabled : old.preference.enabled,
                    channels: Object.assign(Object.assign({}, old.preference.channels), preferences.reduce((acc, { channelType, enabled: channelEnabled }) => {
                        acc[channelType] = channelEnabled;
                        return acc;
                    }, {})),
                },
            };
        });
    }, [queryClient]);
    const _b = (0, react_query_1.useMutation)((variables) => apiService.updateSubscriberGlobalPreference(variables.preferences, variables.enabled), Object.assign(Object.assign({}, options), { onSuccess: (data, variables, context) => {
            queryClient.setQueryData(userGlobalPreferencesQueryKey, () => [data]);
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data, variables, context);
        }, onError: (error, variables, context) => {
            var _a;
            updateGlobalPreferenceChecked({
                enabled: (_a = !variables.enabled) !== null && _a !== void 0 ? _a : undefined,
                preferences: variables.preferences,
            });
            onError === null || onError === void 0 ? void 0 : onError(error, variables, context);
        } })), { mutate } = _b, result = __rest(_b, ["mutate"]);
    const updateUserGlobalPreferences = (0, react_1.useCallback)((variables) => {
        updateGlobalPreferenceChecked(variables);
        mutate(variables);
    }, [updateGlobalPreferenceChecked, mutate]);
    return Object.assign(Object.assign({}, result), { updateUserGlobalPreferences });
};
exports.useUpdateUserGlobalPreferences = useUpdateUserGlobalPreferences;
//# sourceMappingURL=useUpdateUserGlobalPreferences.js.map