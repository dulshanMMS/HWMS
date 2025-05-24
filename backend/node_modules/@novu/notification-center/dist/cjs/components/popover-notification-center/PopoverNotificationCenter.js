"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopoverNotificationCenter = void 0;
const react_1 = __importDefault(require("react"));
const notification_center_1 = require("../notification-center");
const Popover_1 = require("./components/Popover");
const hooks_1 = require("../../hooks");
const defaultTheme_1 = require("../../utils/defaultTheme");
function PopoverNotificationCenter(_a) {
    var { children } = _a, props = __rest(_a, ["children"]);
    const { theme } = (0, defaultTheme_1.getDefaultTheme)({ colorScheme: props.colorScheme, theme: props.theme });
    const { unseenCount } = (0, hooks_1.useNotifications)();
    return (react_1.default.createElement(Popover_1.Popover, { theme: theme, bell: (bellProps) => children(Object.assign(Object.assign({}, bellProps), { unseenCount, theme })), position: props.position, offset: props.offset },
        react_1.default.createElement(notification_center_1.NotificationCenter, { onNotificationClick: props.onNotificationClick, onUrlChange: props.onUrlChange, header: props.header, footer: props.footer, colorScheme: props.colorScheme, theme: props.theme, emptyState: props.emptyState, onActionClick: props.onActionClick, actionsResultBlock: props.actionsResultBlock, listItem: props.listItem, tabs: props.tabs, showUserPreferences: props.showUserPreferences, allowedNotificationActions: props.allowedNotificationActions, onTabClick: props.onTabClick, onUnseenCountChanged: props.onUnseenCountChanged, preferenceFilter: props.preferenceFilter })));
}
exports.PopoverNotificationCenter = PopoverNotificationCenter;
//# sourceMappingURL=PopoverNotificationCenter.js.map