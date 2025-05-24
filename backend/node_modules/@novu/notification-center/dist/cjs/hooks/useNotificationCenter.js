"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNotificationCenter = void 0;
const react_1 = require("react");
const notification_center_context_1 = require("../store/notification-center.context");
function useNotificationCenter() {
    const { onUrlChange, onNotificationClick, onActionClick, isLoading, header, footer, emptyState, listItem, actionsResultBlock, tabs, showUserPreferences, allowedNotificationActions, onTabClick, preferenceFilter, } = (0, react_1.useContext)(notification_center_context_1.NotificationCenterContext);
    return {
        onUrlChange,
        onNotificationClick,
        onActionClick,
        isLoading,
        header,
        footer,
        emptyState,
        listItem,
        actionsResultBlock,
        tabs,
        showUserPreferences,
        allowedNotificationActions,
        onTabClick,
        preferenceFilter,
    };
}
exports.useNotificationCenter = useNotificationCenter;
//# sourceMappingURL=useNotificationCenter.js.map