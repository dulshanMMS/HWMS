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
exports.useUpdateAction = void 0;
const react_query_1 = require("@tanstack/react-query");
const useNovuContext_1 = require("./useNovuContext");
const useFetchNotificationsQueryKey_1 = require("./useFetchNotificationsQueryKey");
const useUpdateAction = (_a = {}) => {
    var { onSuccess } = _a, options = __rest(_a, ["onSuccess"]);
    const queryClient = (0, react_query_1.useQueryClient)();
    const { apiService } = (0, useNovuContext_1.useNovuContext)();
    const fetchNotificationsQueryKey = (0, useFetchNotificationsQueryKey_1.useFetchNotificationsQueryKey)();
    const _b = (0, react_query_1.useMutation)((variables) => apiService.updateAction(variables.messageId, variables.actionButtonType, variables.status, variables.payload), Object.assign(Object.assign({}, options), { onSuccess: (newMessage, variables, context) => {
            queryClient.setQueriesData({ queryKey: fetchNotificationsQueryKey, exact: false }, (infiniteData) => {
                const pages = infiniteData.pages.map((page) => {
                    const data = page.data.map((message) => {
                        if (message._id === variables.messageId) {
                            return newMessage;
                        }
                        return message;
                    });
                    return Object.assign(Object.assign({}, page), { data });
                });
                return {
                    pageParams: infiniteData.pageParams,
                    pages,
                };
            });
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(newMessage, variables, context);
        } })), { mutate } = _b, result = __rest(_b, ["mutate"]);
    return Object.assign(Object.assign({}, result), { updateAction: mutate });
};
exports.useUpdateAction = useUpdateAction;
//# sourceMappingURL=useUpdateAction.js.map