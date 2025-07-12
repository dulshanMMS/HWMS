"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCenterContext = void 0;
const react_1 = __importDefault(require("react"));
exports.NotificationCenterContext = react_1.default.createContext({
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