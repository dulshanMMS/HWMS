import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiService } from '@novu/client';
import { NotificationsProvider } from '../../store/notifications-provider.context';
import { NovuContext } from '../../store/novu-provider.context';
import { NovuI18NProvider } from '../../store/i18n.context';
import { StylesProvider } from '../../store/styles';
import { applyToken, removeToken } from '../../utils/token';
import { useSession } from '../../hooks/useSession';
import { useInitializeSocket } from '../../hooks/useInitializeSocket';
import { useFetchOrganization, useNovuContext } from '../../hooks';
import { SESSION_QUERY_KEY } from '../../hooks/queryKeys';
export const queryClient = new QueryClient({
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
export function NovuProvider({ backendUrl: initialBackendUrl, socketUrl: initialSocketUrl, applicationIdentifier, subscriberId, subscriberHash, stores: initialStores, i18n, styles, initialFetchingStrategy = DEFAULT_FETCHING_STRATEGY, children, onLoad, }) {
    const backendUrl = initialBackendUrl !== null && initialBackendUrl !== void 0 ? initialBackendUrl : 'https://api.novu.co';
    const socketUrl = initialSocketUrl !== null && initialSocketUrl !== void 0 ? initialSocketUrl : 'https://ws.novu.co';
    const stores = initialStores !== null && initialStores !== void 0 ? initialStores : [{ storeId: 'default_store' }];
    const [fetchingStrategy, setFetchingStrategyState] = useState(Object.assign(Object.assign({}, DEFAULT_FETCHING_STRATEGY), initialFetchingStrategy));
    const [sessionInfo, setSessionInfo] = useState({
        isSessionInitialized: false,
        applicationIdentifier,
        subscriberId,
        subscriberHash,
    });
    const apiService = useMemo(() => {
        queryClient.clear();
        const service = new ApiService(backendUrl);
        applyToken({ apiService: service });
        return service;
    }, [backendUrl]);
    const { socket, initializeSocket, disconnectSocket } = useInitializeSocket({ socketUrl });
    const onSuccessfulSession = useCallback((newSession) => {
        applyToken({ apiService, token: newSession.token });
        initializeSocket(newSession);
        setSessionInfo((old) => (Object.assign(Object.assign({}, old), { isSessionInitialized: true })));
    }, [apiService, setSessionInfo, initializeSocket]);
    const setFetchingStrategy = useCallback((strategy) => setFetchingStrategyState((old) => (Object.assign(Object.assign({}, old), strategy))), [setFetchingStrategyState]);
    const logout = useCallback(() => {
        removeToken(apiService);
        disconnectSocket();
        setSessionInfo((old) => (Object.assign(Object.assign({}, old), { isSessionInitialized: false })));
    }, [setSessionInfo, disconnectSocket, apiService]);
    const contextValue = useMemo(() => ({
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
    useEffect(() => disconnectSocket, [disconnectSocket]);
    useEffect(() => {
        setSessionInfo((old) => (Object.assign(Object.assign({}, old), { isSessionInitialized: false, applicationIdentifier,
            subscriberId,
            subscriberHash })));
        logout();
        queryClient.refetchQueries([...SESSION_QUERY_KEY, applicationIdentifier, subscriberId, subscriberHash]);
    }, [logout, subscriberId, applicationIdentifier, subscriberHash]);
    return (React.createElement(QueryClientProvider, { client: queryClient },
        React.createElement(NovuContext.Provider, { value: contextValue },
            React.createElement(SessionInitializer, { onSuccess: onSuccessfulSession },
                React.createElement(NotificationsProvider, { stores: stores },
                    React.createElement(NovuI18NProvider, { i18n: i18n },
                        React.createElement(StylesProvider, { styles: styles }, children)))))));
}
const SessionInitializer = ({ children, onSuccess, }) => {
    const { onLoad } = useNovuContext();
    useSession({ onSuccess });
    useFetchOrganization({
        onSuccess: (organization) => {
            onLoad === null || onLoad === void 0 ? void 0 : onLoad({ organization });
        },
    });
    useEffect(() => {
        if ('parentIFrame' in window) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window.parentIFrame.autoResize(true);
        }
    }, []);
    return children;
};
//# sourceMappingURL=NovuProvider.js.map