const NOTIFICATION_CENTER_TOKEN_KEY = 'widget_user_auth_token';
const isBrowser = typeof window !== 'undefined';
export const getToken = () => {
    if (isBrowser) {
        return localStorage.getItem(NOTIFICATION_CENTER_TOKEN_KEY);
    }
    return null;
};
export const removeToken = (apiService) => {
    isBrowser && localStorage.removeItem(NOTIFICATION_CENTER_TOKEN_KEY);
    apiService.disposeAuthorizationToken();
};
export const applyToken = ({ token = getToken(), apiService }) => {
    if (token) {
        isBrowser && localStorage.setItem(NOTIFICATION_CENTER_TOKEN_KEY, token);
        apiService.setAuthorizationToken(token);
    }
    else {
        removeToken(apiService);
    }
};
//# sourceMappingURL=token.js.map