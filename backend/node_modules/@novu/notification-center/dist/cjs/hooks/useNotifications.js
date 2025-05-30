"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNotifications = void 0;
const react_1 = require("react");
const notifications_context_1 = require("../store/notifications.context");
function useNotifications() {
    return (0, react_1.useContext)(notifications_context_1.NotificationsContext);
}
exports.useNotifications = useNotifications;
//# sourceMappingURL=useNotifications.js.map