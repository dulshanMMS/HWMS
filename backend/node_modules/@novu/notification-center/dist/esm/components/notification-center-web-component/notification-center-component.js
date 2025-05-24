import React from 'react';
import { MessageActionStatusEnum } from '@novu/shared';
import { NovuProvider } from '../novu-provider';
import { PopoverNotificationCenter } from '../popover-notification-center';
import { NotificationBell } from '../notification-bell';
import { reactToWebComponent } from '../../utils';
import { useUpdateAction } from '../../hooks';
/*
 * This array represents the public API of the web component.
 * All the props defined in the NotificationCenterComponentProps should be added here.
 */
export const NOTIFICATION_CENTER_PROPS = [
    'backendUrl',
    'socketUrl',
    'subscriberId',
    'applicationIdentifier',
    'subscriberHash',
    'stores',
    'tabs',
    'showUserPreferences',
    'allowedNotificationActions',
    'popover',
    'popoverConfig',
    'theme',
    'styles',
    'colorScheme',
    'i18n',
    'onLoad',
    'sessionLoaded',
    'onNotificationClick',
    'notificationClicked',
    'onUnseenCountChanged',
    'unseenCountChanged',
    'onActionClick',
    'actionClicked',
    'onTabClick',
    'tabClicked',
    'preferenceFilter',
];
export const NotificationCenterComponent = ({ backendUrl, socketUrl, subscriberId, applicationIdentifier, subscriberHash, stores, tabs, showUserPreferences, allowedNotificationActions, popover, popoverConfig, theme, styles, colorScheme = 'dark', i18n, sessionLoaded, onLoad = sessionLoaded, notificationClicked, onNotificationClick = notificationClicked, unseenCountChanged, onUnseenCountChanged = unseenCountChanged, actionClicked, onActionClick = actionClicked, tabClicked, onTabClick = tabClicked, preferenceFilter, }) => {
    return (React.createElement(NovuProvider, { onLoad: onLoad, stores: stores, backendUrl: backendUrl, socketUrl: socketUrl, subscriberId: subscriberId, applicationIdentifier: applicationIdentifier, subscriberHash: subscriberHash, styles: styles, i18n: i18n },
        React.createElement(PopoverWrapper, { onNotificationClick: onNotificationClick, onUnseenCountChanged: onUnseenCountChanged, onActionClick: onActionClick, onTabClick: onTabClick, colorScheme: colorScheme, theme: theme, tabs: tabs, showUserPreferences: showUserPreferences, allowedNotificationActions: allowedNotificationActions, popover: popover, popoverConfig: popoverConfig, preferenceFilter: preferenceFilter })));
};
function PopoverWrapper({ onNotificationClick, onUnseenCountChanged, onActionClick, onTabClick, colorScheme = 'dark', theme, tabs, showUserPreferences, allowedNotificationActions, popover, popoverConfig, unseenBadgeColor, unseenBadgeBackgroundColor, preferenceFilter, }) {
    const { updateAction } = useUpdateAction();
    function handlerOnActionClick(templateIdentifier, type, message) {
        updateAction({ messageId: message._id, actionButtonType: type, status: MessageActionStatusEnum.DONE });
        onActionClick === null || onActionClick === void 0 ? void 0 : onActionClick(templateIdentifier, type, message);
    }
    return (React.createElement(PopoverNotificationCenter, { onNotificationClick: onNotificationClick, onUnseenCountChanged: onUnseenCountChanged, onActionClick: handlerOnActionClick, onTabClick: onTabClick, preferenceFilter: preferenceFilter, colorScheme: colorScheme, theme: theme, tabs: tabs, showUserPreferences: showUserPreferences, allowedNotificationActions: allowedNotificationActions, offset: (popoverConfig === null || popoverConfig === void 0 ? void 0 : popoverConfig.offset) || (popover === null || popover === void 0 ? void 0 : popover.offset), position: (popoverConfig === null || popoverConfig === void 0 ? void 0 : popoverConfig.position) || (popover === null || popover === void 0 ? void 0 : popover.position) }, ({ unseenCount }) => (React.createElement(NotificationBell, { colorScheme: colorScheme, unseenCount: unseenCount, unseenBadgeColor: unseenBadgeColor, unseenBadgeBackgroundColor: unseenBadgeBackgroundColor }))));
}
export const NotificationCenterWebComponent = reactToWebComponent(NotificationCenterComponent, {
    props: NOTIFICATION_CENTER_PROPS,
});
//# sourceMappingURL=notification-center-component.js.map