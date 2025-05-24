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
import React from 'react';
import { NotificationCenter } from '../notification-center';
import { Popover } from './components/Popover';
import { useNotifications } from '../../hooks';
import { getDefaultTheme } from '../../utils/defaultTheme';
export function PopoverNotificationCenter(_a) {
    var { children } = _a, props = __rest(_a, ["children"]);
    const { theme } = getDefaultTheme({ colorScheme: props.colorScheme, theme: props.theme });
    const { unseenCount } = useNotifications();
    return (React.createElement(Popover, { theme: theme, bell: (bellProps) => children(Object.assign(Object.assign({}, bellProps), { unseenCount, theme })), position: props.position, offset: props.offset },
        React.createElement(NotificationCenter, { onNotificationClick: props.onNotificationClick, onUrlChange: props.onUrlChange, header: props.header, footer: props.footer, colorScheme: props.colorScheme, theme: props.theme, emptyState: props.emptyState, onActionClick: props.onActionClick, actionsResultBlock: props.actionsResultBlock, listItem: props.listItem, tabs: props.tabs, showUserPreferences: props.showUserPreferences, allowedNotificationActions: props.allowedNotificationActions, onTabClick: props.onTabClick, onUnseenCountChanged: props.onUnseenCountChanged, preferenceFilter: props.preferenceFilter })));
}
//# sourceMappingURL=PopoverNotificationCenter.js.map