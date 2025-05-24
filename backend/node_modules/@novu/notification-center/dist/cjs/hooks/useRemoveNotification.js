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
exports.useRemoveNotification = void 0;
const react_query_1 = require("@tanstack/react-query");
const useNovuContext_1 = require("./useNovuContext");
const useFetchNotificationsQueryKey_1 = require("./useFetchNotificationsQueryKey");
const useRemoveNotification = (_a = {}) => {
    var { onSuccess } = _a, options = __rest(_a, ["onSuccess"]);
    const queryClient = (0, react_query_1.useQueryClient)();
    const { apiService } = (0, useNovuContext_1.useNovuContext)();
    const fetchNotificationsQueryKey = (0, useFetchNotificationsQueryKey_1.useFetchNotificationsQueryKey)();
    const _b = (0, react_query_1.useMutation)(({ messageId }) => apiService.removeMessage(messageId), Object.assign(Object.assign({}, options), { onSuccess: (data, variables, context) => {
            queryClient.refetchQueries(fetchNotificationsQueryKey, { exact: false });
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data, variables, context);
        } })), { mutate } = _b, result = __rest(_b, ["mutate"]);
    return Object.assign(Object.assign({}, result), { removeNotification: mutate });
};
exports.useRemoveNotification = useRemoveNotification;
//# sourceMappingURL=useRemoveNotification.js.map