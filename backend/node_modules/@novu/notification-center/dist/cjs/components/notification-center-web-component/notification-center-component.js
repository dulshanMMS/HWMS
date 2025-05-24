"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCenterWebComponent = exports.NotificationCenterComponent = exports.NOTIFICATION_CENTER_PROPS = void 0;
const react_1 = __importDefault(require("react"));
const shared_1 = require("@novu/shared");
const novu_provider_1 = require("../novu-provider");
const popover_notification_center_1 = require("../popover-notification-center");
const notification_bell_1 = require("../notification-bell");
const utils_1 = require("../../utils");
const hooks_1 = require("../../hooks");
/*
 * This array represents the public API of the web component.
 * All the props defined in the NotificationCenterComponentProps should be added here.
 */
exports.NOTIFICATION_CENTER_PROPS = [
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
const NotificationCenterComponent = ({ backendUrl, socketUrl, subscriberId, applicationIdentifier, subscriberHash, stores, tabs, showUserPreferences, allowedNotificationActions, popover, popoverConfig, theme, styles, colorScheme = 'dark', i18n, sessionLoaded, onLoad = sessionLoaded, notificationClicked, onNotificationClick = notificationClicked, unseenCountChanged, onUnseenCountChanged = unseenCountChanged, actionClicked, onActionClick = actionClicked, tabClicked, onTabClick = tabClicked, preferenceFilter, }) => {
    return (react_1.default.createElement(novu_provider_1.NovuProvider, { onLoad: onLoad, stores: stores, backendUrl: backendUrl, socketUrl: socketUrl, subscriberId: subscriberId, applicationIdentifier: applicationIdentifier, subscriberHash: subscriberHash, styles: styles, i18n: i18n },
        react_1.default.createElement(PopoverWrapper, { onNotificationClick: onNotificationClick, onUnseenCountChanged: onUnseenCountChanged, onActionClick: onActionClick, onTabClick: onTabClick, colorScheme: colorScheme, theme: theme, tabs: tabs, showUserPreferences: showUserPreferences, allowedNotificationActions: allowedNotificationActions, popover: popover, popoverConfig: popoverConfig, preferenceFilter: preferenceFilter })));
};
exports.NotificationCenterComponent = NotificationCenterComponent;
function PopoverWrapper({ onNotificationClick, onUnseenCountChanged, onActionClick, onTabClick, colorScheme = 'dark', theme, tabs, showUserPreferences, allowedNotificationActions, popover, popoverConfig, unseenBadgeColor, unseenBadgeBackgroundColor, preferenceFilter, }) {
    const { updateAction } = (0, hooks_1.useUpdateAction)();
    function handlerOnActionClick(templateIdentifier, type, message) {
        updateAction({ messageId: message._id, actionButtonType: type, status: shared_1.MessageActionStatusEnum.DONE });
        onActionClick === null || onActionClick === void 0 ? void 0 : onActionClick(templateIdentifier, type, message);
    }
    return (react_1.default.createElement(popover_notification_center_1.PopoverNotificationCenter, { onNotificationClick: onNotificationClick, onUnseenCountChanged: onUnseenCountChanged, onActionClick: handlerOnActionClick, onTabClick: onTabClick, preferenceFilter: preferenceFilter, colorScheme: colorScheme, theme: theme, tabs: tabs, showUserPreferences: showUserPreferences, allowedNotificationActions: allowedNotificationActions, offset: (popoverConfig === null || popoverConfig === void 0 ? void 0 : popoverConfig.offset) || (popover === null || popover === void 0 ? void 0 : popover.offset), position: (popoverConfig === null || popoverConfig === void 0 ? void 0 : popoverConfig.position) || (popover === null || popover === void 0 ? void 0 : popover.position) }, ({ unseenCount }) => (react_1.default.createElement(notification_bell_1.NotificationBell, { colorScheme: colorScheme, unseenCount: unseenCount, unseenBadgeColor: unseenBadgeColor, unseenBadgeBackgroundColor: unseenBadgeBackgroundColor }))));
}
exports.NotificationCenterWebComponent = (0, utils_1.reactToWebComponent)(exports.NotificationCenterComponent, {
    props: exports.NOTIFICATION_CENTER_PROPS,
});
//# sourceMappingURL=notification-center-component.js.map