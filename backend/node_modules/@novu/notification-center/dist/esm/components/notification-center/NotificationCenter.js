import React, { useEffect, useRef } from 'react';
import { AppContent } from './components';
import { useNotifications, useNovuContext } from '../../hooks';
import { NotificationCenterContext } from '../../store/notification-center.context';
import { NovuThemeProvider } from '../../store/novu-theme-provider.context';
export function NotificationCenter({ onUnseenCountChanged, onUrlChange, onNotificationClick, onActionClick, preferenceFilter, header, footer, emptyState, listItem, actionsResultBlock, tabs, showUserPreferences, allowedNotificationActions, onTabClick, colorScheme, theme, }) {
    const { applicationIdentifier } = useNovuContext();
    const { unseenCount } = useNotifications();
    const onUnseenCountChangedRef = useRef(onUnseenCountChanged);
    onUnseenCountChangedRef.current = onUnseenCountChanged;
    useEffect(() => {
        if (onUnseenCountChangedRef.current) {
            onUnseenCountChangedRef.current(unseenCount);
        }
    }, [unseenCount, window.parentIFrame, onUnseenCountChangedRef]);
    return (React.createElement(NotificationCenterContext.Provider, { value: {
            onUrlChange: onUrlChange,
            onNotificationClick: onNotificationClick,
            onActionClick: onActionClick,
            onTabClick: onTabClick ? onTabClick : () => { },
            preferenceFilter: preferenceFilter,
            isLoading: !applicationIdentifier,
            header: header,
            footer: footer,
            emptyState: emptyState,
            listItem: listItem,
            actionsResultBlock: actionsResultBlock,
            tabs: tabs,
            showUserPreferences: showUserPreferences !== null && showUserPreferences !== void 0 ? showUserPreferences : true,
            allowedNotificationActions: allowedNotificationActions !== null && allowedNotificationActions !== void 0 ? allowedNotificationActions : true,
        } },
        React.createElement(NovuThemeProvider, { colorScheme: colorScheme, theme: theme },
            React.createElement(AppContent, null))));
}
//# sourceMappingURL=NotificationCenter.js.map