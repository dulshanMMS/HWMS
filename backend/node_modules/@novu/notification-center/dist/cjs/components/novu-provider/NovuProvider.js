"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovuProvider = exports.queryClient = void 0;
const react_1 = __importStar(require("react"));
const react_query_1 = require("@tanstack/react-query");
const client_1 = require("@novu/client");
const notifications_provider_context_1 = require("../../store/notifications-provider.context");
const novu_provider_context_1 = require("../../store/novu-provider.context");
const i18n_context_1 = require("../../store/i18n.context");
const styles_1 = require("../../store/styles");
const token_1 = require("../../utils/token");
const useSession_1 = require("../../hooks/useSession");
const useInitializeSocket_1 = require("../../hooks/useInitializeSocket");
const hooks_1 = require("../../hooks");
const queryKeys_1 = require("../../hooks/queryKeys");
exports.queryClient = new react_query_1.QueryClient({
    defaultOptions: {
        queries: {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        },
    },
});
const DEFAULT_FETCHING_STRATEGY = {
    fetchUnseenCount: true,
    fetchOrganization: true,
    fetchUnreadCount: true,
    fetchNotifications: false,
    fetchUserPreferences: false,
    fetchUserGlobalPreferences: false,
};
function NovuProvider({ backendUrl: initialBackendUrl, socketUrl: initialSocketUrl, applicationIdentifier, subscriberId, subscriberHash, stores: initialStores, i18n, styles, initialFetchingStrategy = DEFAULT_FETCHING_STRATEGY, children, onLoad, }) {
    const backendUrl = initialBackendUrl !== null && initialBackendUrl !== void 0 ? initialBackendUrl : 'https://api.novu.co';
    const socketUrl = initialSocketUrl !== null && initialSocketUrl !== void 0 ? initialSocketUrl : 'https://ws.novu.co';
    const stores = initialStores !== null && initialStores !== void 0 ? initialStores : [{ storeId: 'default_store' }];
    const [fetchingStrategy, setFetchingStrategyState] = (0, react_1.useState)(Object.assign(Object.assign({}, DEFAULT_FETCHING_STRATEGY), initialFetchingStrategy));
    const [sessionInfo, setSessionInfo] = (0, react_1.useState)({
        isSessionInitialized: false,
        applicationIdentifier,
        subscriberId,
        subscriberHash,
    });
    const apiService = (0, react_1.useMemo)(() => {
        exports.queryClient.clear();
        const service = new client_1.ApiService(backendUrl);
        (0, token_1.applyToken)({ apiService: service });
        return service;
    }, [backendUrl]);
    const { socket, initializeSocket, disconnectSocket } = (0, useInitializeSocket_1.useInitializeSocket)({ socketUrl });
    const onSuccessfulSession = (0, react_1.useCallback)((newSession) => {
        (0, token_1.applyToken)({ apiService, token: newSession.token });
        initializeSocket(newSession);
        setSessionInfo((old) => (Object.assign(Object.assign({}, old), { isSessionInitialized: true })));
    }, [apiService, setSessionInfo, initializeSocket]);
    const setFetchingStrategy = (0, react_1.useCallback)((strategy) => setFetchingStrategyState((old) => (Object.assign(Object.assign({}, old), strategy))), [setFetchingStrategyState]);
    const logout = (0, react_1.useCallback)(() => {
        (0, token_1.removeToken)(apiService);
        disconnectSocket();
        setSessionInfo((old) => (Object.assign(Object.assign({}, old), { isSessionInitialized: false })));
    }, [setSessionInfo, disconnectSocket, apiService]);
    const contextValue = (0, react_1.useMemo)(() => ({
        backendUrl,
        socketUrl,
        applicationIdentifier: sessionInfo.applicationIdentifier,
        subscriberId: sessionInfo.subscriberId,
        subscriberHash: sessionInfo.subscriberHash,
        isSessionInitialized: sessionInfo.isSessionInitialized,
        apiService,
        socket,
        fetchingStrategy,
        setFetchingStrategy,
        onLoad,
        logout,
    }), [backendUrl, socketUrl, sessionInfo, apiService, socket, fetchingStrategy, setFetchingStrategy, onLoad, logout]);
    (0, react_1.useEffect)(() => disconnectSocket, [disconnectSocket]);
    (0, react_1.useEffect)(() => {
        setSessionInfo((old) => (Object.assign(Object.assign({}, old), { isSessionInitialized: false, applicationIdentifier,
            subscriberId,
            subscriberHash })));
        logout();
        exports.queryClient.refetchQueries([...queryKeys_1.SESSION_QUERY_KEY, applicationIdentifier, subscriberId, subscriberHash]);
    }, [logout, subscriberId, applicationIdentifier, subscriberHash]);
    return (react_1.default.createElement(react_query_1.QueryClientProvider, { client: exports.queryClient },
        react_1.default.createElement(novu_provider_context_1.NovuContext.Provider, { value: contextValue },
            react_1.default.createElement(SessionInitializer, { onSuccess: onSuccessfulSession },
                react_1.default.createElement(notifications_provider_context_1.NotificationsProvider, { stores: stores },
                    react_1.default.createElement(i18n_context_1.NovuI18NProvider, { i18n: i18n },
                        react_1.default.createElement(styles_1.StylesProvider, { styles: styles }, children)))))));
}
exports.NovuProvider = NovuProvider;
const SessionInitializer = ({ children, onSuccess, }) => {
    const { onLoad } = (0, hooks_1.useNovuContext)();
    (0, useSession_1.useSession)({ onSuccess });
    (0, hooks_1.useFetchOrganization)({
        onSuccess: (organization) => {
            onLoad === null || onLoad === void 0 ? void 0 : onLoad({ organization });
        },
    });
    (0, react_1.useEffect)(() => {
        if ('parentIFrame' in window) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window.parentIFrame.autoResize(true);
        }
    }, []);
    return children;
};
//# sourceMappingURL=NovuProvider.js.map