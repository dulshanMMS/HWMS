"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsListTab = void 0;
const react_1 = __importDefault(require("react"));
const shared_1 = require("@novu/shared");
const hooks_1 = require("../../../hooks");
const NotificationsList_1 = require("./NotificationsList");
const Loader_1 = require("./Loader");
const colors_1 = require("../../../shared/config/colors");
const NoNewNotifications_1 = require("../../../images/NoNewNotifications");
function NotificationsListTab() {
    const { apiService } = (0, hooks_1.useNovuContext)();
    const { onNotificationClick, onUrlChange, emptyState } = (0, hooks_1.useNotificationCenter)();
    const { notifications, isLoading, hasNextPage, markNotificationAsRead, fetchNextPage } = (0, hooks_1.useNotifications)();
    const { t } = (0, hooks_1.useTranslations)();
    function fetchNext() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fetchNextPage();
        });
    }
    function onNotificationClicked(notification) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            markNotificationAsRead(notification._id);
            if (onNotificationClick) {
                onNotificationClick(notification);
            }
            const hasCta = ((_a = notification.cta) === null || _a === void 0 ? void 0 : _a.type) === shared_1.ChannelCTATypeEnum.REDIRECT && ((_c = (_b = notification.cta) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.url);
            apiService.postUsageLog('Notification Click', {
                notificationId: notification._id,
                hasCta,
            });
            if (hasCta && ((_e = (_d = notification.cta) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.url) && onUrlChange) {
                onUrlChange(notification.cta.data.url);
            }
        });
    }
    return isLoading ? (react_1.default.createElement(Loader_1.Loader, null)) : (react_1.default.createElement(react_1.default.Fragment, null, !isLoading && (notifications === null || notifications === void 0 ? void 0 : notifications.length) === 0 ? (react_1.default.createElement(react_1.default.Fragment, null, emptyState ? (emptyState) : (react_1.default.createElement("div", { style: {
            textAlign: 'center',
            flexDirection: 'column',
            minHeight: 350,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        } },
        react_1.default.createElement(NoNewNotifications_1.NoNewNotifications, { style: { maxWidth: 200, marginBottom: 15 } }),
        react_1.default.createElement("span", { style: { color: colors_1.colors.B70, fontSize: 15 } }, t('noNewNotification')))))) : (react_1.default.createElement(NotificationsList_1.NotificationsList, { onNotificationClicked: onNotificationClicked, notifications: notifications || [], onFetch: fetchNext, hasNextPage: hasNextPage }))));
}
exports.NotificationsListTab = NotificationsListTab;
//# sourceMappingURL=NotificationsListTab.js.map