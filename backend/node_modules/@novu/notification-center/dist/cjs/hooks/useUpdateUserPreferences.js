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
exports.useUpdateUserPreferences = void 0;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const useNovuContext_1 = require("./useNovuContext");
const useFetchUserPreferencesQueryKey_1 = require("./useFetchUserPreferencesQueryKey");
const useUpdateUserPreferences = (_a = {}) => {
    var { onSuccess, onError } = _a, options = __rest(_a, ["onSuccess", "onError"]);
    const queryClient = (0, react_query_1.useQueryClient)();
    const { apiService } = (0, useNovuContext_1.useNovuContext)();
    const userPreferencesQueryKey = (0, useFetchUserPreferencesQueryKey_1.useFetchUserPreferencesQueryKey)();
    const updatePreferenceChecked = (0, react_1.useCallback)(({ templateId, checked, channelType }) => {
        queryClient.setQueryData(userPreferencesQueryKey, (oldUserPreferences) => oldUserPreferences === null || oldUserPreferences === void 0 ? void 0 : oldUserPreferences.map((setting) => {
            if (setting.template._id === templateId) {
                return Object.assign(Object.assign({}, setting), { preference: Object.assign(Object.assign({}, setting.preference), { channels: Object.assign(Object.assign({}, setting.preference.channels), { [channelType]: checked }) }) });
            }
            return setting;
        }));
    }, [queryClient]);
    const _b = (0, react_query_1.useMutation)((variables) => apiService.updateSubscriberPreference(variables.templateId, variables.channelType, variables.checked), Object.assign(Object.assign({}, options), { onSuccess: (data, variables, context) => {
            queryClient.setQueryData(userPreferencesQueryKey, (oldUserPreferences) => oldUserPreferences === null || oldUserPreferences === void 0 ? void 0 : oldUserPreferences.map((setting) => {
                if (setting.template._id === data.template._id) {
                    return data;
                }
                return setting;
            }));
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data, variables, context);
        }, onError: (error, variables, context) => {
            updatePreferenceChecked({
                templateId: variables.templateId,
                checked: !variables.checked,
                channelType: variables.channelType,
            });
            onError === null || onError === void 0 ? void 0 : onError(error, variables, context);
        } })), { mutate } = _b, result = __rest(_b, ["mutate"]);
    const updateUserPreferences = (0, react_1.useCallback)((variables) => {
        updatePreferenceChecked(variables);
        mutate(variables);
    }, [updatePreferenceChecked, mutate]);
    return Object.assign(Object.assign({}, result), { updateUserPreferences });
};
exports.useUpdateUserPreferences = useUpdateUserPreferences;
//# sourceMappingURL=useUpdateUserPreferences.js.map