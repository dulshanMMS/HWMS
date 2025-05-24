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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useFetchUserGlobalPreferencesQueryKey } from './useFetchUserGlobalPreferencesQueryKey';
import { useNovuContext } from './useNovuContext';
export const useUpdateUserGlobalPreferences = (_a = {}) => {
    var { onSuccess, onError } = _a, options = __rest(_a, ["onSuccess", "onError"]);
    const queryClient = useQueryClient();
    const { apiService } = useNovuContext();
    const userGlobalPreferencesQueryKey = useFetchUserGlobalPreferencesQueryKey();
    const updateGlobalPreferenceChecked = useCallback(({ enabled, preferences }) => {
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
    const _b = useMutation((variables) => apiService.updateSubscriberGlobalPreference(variables.preferences, variables.enabled), Object.assign(Object.assign({}, options), { onSuccess: (data, variables, context) => {
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
    const updateUserGlobalPreferences = useCallback((variables) => {
        updateGlobalPreferenceChecked(variables);
        mutate(variables);
    }, [updateGlobalPreferenceChecked, mutate]);
    return Object.assign(Object.assign({}, result), { updateUserGlobalPreferences });
};
//# sourceMappingURL=useUpdateUserGlobalPreferences.js.map