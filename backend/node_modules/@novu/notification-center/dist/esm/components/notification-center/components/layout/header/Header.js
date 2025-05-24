import React, { useContext, useEffect, useState } from 'react';
import { css, cx } from '@emotion/css';
import styled from '@emotion/styled';
import { ActionIcon } from '@mantine/core';
import { useNotifications, useNovuTheme, useTranslations } from '../../../../../hooks';
import { Cogs } from '../../../../../shared/icons';
import { NotificationCenterContext } from '../../../../../store/notification-center.context';
import { useStyles } from '../../../../../store/styles';
import { UnseenBadge } from '../../UnseenBadge';
export function Header({ onCogClick }) {
    var _a;
    const [allRead, setAllRead] = useState(true);
    const { markAllNotificationsAsRead, notifications, unseenCount } = useNotifications();
    const { theme } = useNovuTheme();
    const { tabs, showUserPreferences } = useContext(NotificationCenterContext);
    const { t } = useTranslations();
    const [headerStyles, headerTitleStyles, headerMarkAsReadStyles, headerCogStyles] = useStyles([
        'header.root',
        'header.title',
        'header.markAsRead',
        'header.cog',
    ]);
    useEffect(() => {
        if (notifications) {
            const read = notifications.some((msg) => msg.read === false);
            setAllRead(read);
        }
    }, [notifications]);
    return (React.createElement("div", { className: cx('nc-header', headerClassName, css(headerStyles)) },
        React.createElement("div", { style: { display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' } },
            React.createElement("div", { className: cx('nc-header-title', titleClassName(theme.header.fontColor), css(headerTitleStyles)), "data-test-id": "notifications-header-title" }, t('notifications')),
            !tabs && React.createElement(UnseenBadge, { unseenCount: unseenCount })),
        React.createElement(ActionItems, null,
            React.createElement("div", { className: cx('nc-header-mark-as-read', markAsReadClassName(!allRead, (_a = theme.header) === null || _a === void 0 ? void 0 : _a.markAllAsReadButtonColor), css(headerMarkAsReadStyles)), onClick: markAllNotificationsAsRead, role: "button", tabIndex: 0, "data-test-id": "notifications-header-mark-all-as-read" }, t('markAllAsRead')),
            React.createElement("div", { style: { display: showUserPreferences ? 'inline-block' : 'none' } },
                React.createElement(ActionIcon, { "data-test-id": "user-preference-cog", variant: "transparent", onClick: onCogClick },
                    React.createElement(Cogs, { className: cx('nc-header-cog', cogClassName(theme), css(headerCogStyles)) }))))));
}
const headerClassName = css `
  padding: 5px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 55px;
`;
const ActionItems = styled.div `
  display: flex;
  align-items: center;
`;
const cogClassName = (theme) => {
    var _a;
    return css `
  color: ${(_a = theme === null || theme === void 0 ? void 0 : theme.userPreferences) === null || _a === void 0 ? void 0 : _a.settingsButtonColor};
`;
};
const titleClassName = (fontColor) => css `
  color: ${fontColor};
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  text-align: center;
`;
const markAsReadClassName = (disabled, fontColor) => css `
  margin-right: 10px;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 17px;
  color: ${fontColor};
  cursor: pointer;
  pointer-events: ${disabled ? 'none' : 'auto'};
  opacity: ${disabled ? 0.5 : 1};
`;
//# sourceMappingURL=Header.js.map