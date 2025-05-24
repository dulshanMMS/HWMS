"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCenterContentWebComponent = exports.NotificationCenterContentComponent = exports.NOTIFICATION_CENTER_CONTENT_PROPS = void 0;
const react_1 = __importDefault(require("react"));
const novu_provider_1 = require("../novu-provider");
const utils_1 = require("../../utils");
const notification_center_1 = require("../notification-center");
/*
 * This array represents the public API of the web component.
 * All the props defined in the NotificationCenterComponentProps should be added here.
 */
exports.NOTIFICATION_CENTER_CONTENT_PROPS = [
    'backendUrl',
    'socketUrl',
    'subscriberId',
    'applicationIdentifier',
    'subscriberHash',
    'stores',
    'tabs',
    'showUserPreferences',
    'allowedNotificationActions',
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
const NotificationCenterContentComponent = ({ backendUrl, socketUrl, subscriberId, applicationIdentifier, subscriberHash, stores, tabs, showUserPreferences, allowedNotificationActions, theme, styles, colorScheme = 'dark', i18n, sessionLoaded, onLoad = sessionLoaded, notificationClicked, onNotificationClick = notificationClicked, unseenCountChanged, onUnseenCountChanged = unseenCountChanged, actionClicked, onActionClick = actionClicked, tabClicked, onTabClick = tabClicked, preferenceFilter, }) => {
    return (react_1.default.createElement(novu_provider_1.NovuProvider, { onLoad: onLoad, stores: stores, backendUrl: backendUrl, socketUrl: socketUrl, subscriberId: subscriberId, applicationIdentifier: applicationIdentifier, subscriberHash: subscriberHash, styles: styles, i18n: i18n },
        react_1.default.createElement(notification_center_1.NotificationCenter, { onNotificationClick: onNotificationClick, onUnseenCountChanged: onUnseenCountChanged, colorScheme: colorScheme, theme: theme, onActionClick: onActionClick, tabs: tabs, showUserPreferences: showUserPreferences, allowedNotificationActions: allowedNotificationActions, onTabClick: onTabClick, preferenceFilter: preferenceFilter })));
};
exports.NotificationCenterContentComponent = NotificationCenterContentComponent;
exports.NotificationCenterContentWebComponent = (0, utils_1.reactToWebComponent)(exports.NotificationCenterContentComponent, {
    props: exports.NOTIFICATION_CENTER_CONTENT_PROPS,
});
//# sourceMappingURL=notification-center-content-component.js.map