import React from 'react';
export const NotificationCenterContext = React.createContext({
    onUrlChange: (url) => { },
    onNotificationClick: (notification) => { },
    onUnseenCountChanged: (unseenCount) => { },
    onActionClick: (identifier, type, message) => { },
    onTabClick: (tab) => { },
    preferenceFilter: (userPreference) => { },
    isLoading: true,
    header: null,
    footer: null,
    emptyState: null,
    listItem: null,
    actionsResultBlock: null,
    tabs: [],
    showUserPreferences: true,
    allowedNotificationActions: true,
});
//# sourceMappingURL=notification-center.context.js.map