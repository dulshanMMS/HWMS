var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React from 'react';
import { ChannelCTATypeEnum } from '@novu/shared';
import { useNotifications, useNotificationCenter, useNovuContext, useTranslations } from '../../../hooks';
import { NotificationsList } from './NotificationsList';
import { Loader } from './Loader';
import { colors } from '../../../shared/config/colors';
import { NoNewNotifications } from '../../../images/NoNewNotifications';
export function NotificationsListTab() {
    const { apiService } = useNovuContext();
    const { onNotificationClick, onUrlChange, emptyState } = useNotificationCenter();
    const { notifications, isLoading, hasNextPage, markNotificationAsRead, fetchNextPage } = useNotifications();
    const { t } = useTranslations();
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
            const hasCta = ((_a = notification.cta) === null || _a === void 0 ? void 0 : _a.type) === ChannelCTATypeEnum.REDIRECT && ((_c = (_b = notification.cta) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.url);
            apiService.postUsageLog('Notification Click', {
                notificationId: notification._id,
                hasCta,
            });
            if (hasCta && ((_e = (_d = notification.cta) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.url) && onUrlChange) {
                onUrlChange(notification.cta.data.url);
            }
        });
    }
    return isLoading ? (React.createElement(Loader, null)) : (React.createElement(React.Fragment, null, !isLoading && (notifications === null || notifications === void 0 ? void 0 : notifications.length) === 0 ? (React.createElement(React.Fragment, null, emptyState ? (emptyState) : (React.createElement("div", { style: {
            textAlign: 'center',
            flexDirection: 'column',
            minHeight: 350,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        } },
        React.createElement(NoNewNotifications, { style: { maxWidth: 200, marginBottom: 15 } }),
        React.createElement("span", { style: { color: colors.B70, fontSize: 15 } }, t('noNewNotification')))))) : (React.createElement(NotificationsList, { onNotificationClicked: onNotificationClicked, notifications: notifications || [], onFetch: fetchNext, hasNextPage: hasNextPage }))));
}
//# sourceMappingURL=NotificationsListTab.js.map