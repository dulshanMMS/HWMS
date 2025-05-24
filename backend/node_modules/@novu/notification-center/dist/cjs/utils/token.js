"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyToken = exports.removeToken = exports.getToken = void 0;
const NOTIFICATION_CENTER_TOKEN_KEY = 'widget_user_auth_token';
const isBrowser = typeof window !== 'undefined';
const getToken = () => {
    if (isBrowser) {
        return localStorage.getItem(NOTIFICATION_CENTER_TOKEN_KEY);
    }
    return null;
};
exports.getToken = getToken;
const removeToken = (apiService) => {
    isBrowser && localStorage.removeItem(NOTIFICATION_CENTER_TOKEN_KEY);
    apiService.disposeAuthorizationToken();
};
exports.removeToken = removeToken;
const applyToken = ({ token = (0, exports.getToken)(), apiService }) => {
    if (token) {
        isBrowser && localStorage.setItem(NOTIFICATION_CENTER_TOKEN_KEY, token);
        apiService.setAuthorizationToken(token);
    }
    else {
        (0, exports.removeToken)(apiService);
    }
};
exports.applyToken = applyToken;
//# sourceMappingURL=token.js.map