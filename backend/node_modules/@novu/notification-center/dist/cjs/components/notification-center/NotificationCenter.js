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
exports.NotificationCenter = void 0;
const react_1 = __importStar(require("react"));
const components_1 = require("./components");
const hooks_1 = require("../../hooks");
const notification_center_context_1 = require("../../store/notification-center.context");
const novu_theme_provider_context_1 = require("../../store/novu-theme-provider.context");
function NotificationCenter({ onUnseenCountChanged, onUrlChange, onNotificationClick, onActionClick, preferenceFilter, header, footer, emptyState, listItem, actionsResultBlock, tabs, showUserPreferences, allowedNotificationActions, onTabClick, colorScheme, theme, }) {
    const { applicationIdentifier } = (0, hooks_1.useNovuContext)();
    const { unseenCount } = (0, hooks_1.useNotifications)();
    const onUnseenCountChangedRef = (0, react_1.useRef)(onUnseenCountChanged);
    onUnseenCountChangedRef.current = onUnseenCountChanged;
    (0, react_1.useEffect)(() => {
        if (onUnseenCountChangedRef.current) {
            onUnseenCountChangedRef.current(unseenCount);
        }
    }, [unseenCount, window.parentIFrame, onUnseenCountChangedRef]);
    return (react_1.default.createElement(notification_center_context_1.NotificationCenterContext.Provider, { value: {
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
        react_1.default.createElement(novu_theme_provider_context_1.NovuThemeProvider, { colorScheme: colorScheme, theme: theme },
            react_1.default.createElement(components_1.AppContent, null))));
}
exports.NotificationCenter = NotificationCenter;
//# sourceMappingURL=NotificationCenter.js.map