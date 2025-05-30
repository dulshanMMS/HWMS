"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsList = void 0;
const react_1 = __importDefault(require("react"));
const css_1 = require("@emotion/css");
const react_infinite_scroll_component_1 = __importDefault(require("react-infinite-scroll-component"));
const NotificationListItem_1 = require("./notification-item/NotificationListItem");
const Loader_1 = require("./Loader");
const styles_1 = require("../../../store/styles");
function NotificationsList({ notifications, onFetch, hasNextPage, onNotificationClicked, }) {
    const totalCount = notifications === null || notifications === void 0 ? void 0 : notifications.length;
    const [notificationsListStyles] = (0, styles_1.useStyles)('notifications.root');
    return (react_1.default.createElement("div", { className: (0, css_1.cx)('nc-notifications-list', notificationsListCss, (0, css_1.css)(notificationsListStyles)), id: "notifications-list", "data-test-id": "notifications-scroll-area" },
        react_1.default.createElement(react_infinite_scroll_component_1.default, { dataLength: totalCount, next: onFetch, hasMore: hasNextPage, loader: react_1.default.createElement(Loader_1.Loader, null), endMessage: false, scrollableTarget: "notifications-list" }, notifications.map((notification) => {
            return (react_1.default.createElement(NotificationListItem_1.NotificationListItem, { key: notification._id, notification: notification, onClick: onNotificationClicked }));
        }))));
}
exports.NotificationsList = NotificationsList;
const notificationsListCss = (0, css_1.css) `
  height: 400px;
  overflow-y: auto;
`;
//# sourceMappingURL=NotificationsList.js.map