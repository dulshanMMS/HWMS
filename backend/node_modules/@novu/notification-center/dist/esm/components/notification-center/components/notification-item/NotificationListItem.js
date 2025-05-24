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
import { Avatar as MAvatar, ActionIcon, Menu, createStyles } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { css, cx } from '@emotion/css';
import styled from '@emotion/styled';
import { MessageActionStatusEnum, ActorTypeEnum, SystemAvatarIconEnum, } from '@novu/shared';
import { useNovuTheme, useNotificationCenter, useTranslations, useNotifications } from '../../../../hooks';
import { getDefaultBellColors } from '../../../../utils/defaultTheme';
import { ActionContainer } from './ActionContainer';
import { When } from '../../../../shared/utils/When';
import { shadows } from '../../../../shared/config/shadows';
import { DotsHorizontal, ErrorIcon, Info, Success, Warning, Avatar, Up, Question, GradientDot, Trash, Read, } from '../../../../shared/icons';
import { colors } from '../../../../shared/config/colors';
import { useStyles } from '../../../../store/styles';
import { formatRelativeTime } from '../../../../utils/date';
const avatarSystemIcons = [
    {
        icon: React.createElement(Warning, null),
        type: SystemAvatarIconEnum.WARNING,
        iconColor: '#FFF000',
        containerBgColor: '#FFF00026',
    },
    {
        icon: React.createElement(Info, null),
        type: SystemAvatarIconEnum.INFO,
        iconColor: '#0000FF',
        containerBgColor: '#0000FF26',
    },
    {
        icon: React.createElement(Up, null),
        type: SystemAvatarIconEnum.UP,
        iconColor: colors.B70,
        containerBgColor: `${colors.B70}26`,
    },
    {
        icon: React.createElement(Question, null),
        type: SystemAvatarIconEnum.QUESTION,
        iconColor: colors.B70,
        containerBgColor: `${colors.B70}26`,
    },
    {
        icon: React.createElement(Success, null),
        type: SystemAvatarIconEnum.SUCCESS,
        iconColor: colors.success,
        containerBgColor: `${colors.success}26`,
    },
    {
        icon: React.createElement(ErrorIcon, null),
        type: SystemAvatarIconEnum.ERROR,
        iconColor: colors.error,
        containerBgColor: `${colors.error}26`,
    },
];
export function NotificationListItem({ notification, onClick, }) {
    var _a, _b, _c;
    const { theme: novuTheme, colorScheme } = useNovuTheme();
    const { onActionClick, listItem, allowedNotificationActions } = useNotificationCenter();
    const { removeMessage, markNotificationAsRead, markNotificationAsUnRead } = useNotifications();
    const { t, lang } = useTranslations();
    const { hovered, ref } = useHover();
    const unread = readSupportAdded(notification) ? !notification.read : !notification.seen;
    const [listItemReadStyles, listItemUnreadStyles, listItemLayoutStyles, listItemContentLayoutStyles, listItemTitleStyles, listItemTimestampStyles, menuDotsButtonStyles, menuDropdownStyles, menuArrowStyles, menuItemStyles,] = useStyles([
        'notifications.listItem.read',
        'notifications.listItem.unread',
        'notifications.listItem.layout',
        'notifications.listItem.contentLayout',
        'notifications.listItem.title',
        'notifications.listItem.timestamp',
        'notifications.listItem.dotsButton',
        'actionsMenu.dropdown',
        'actionsMenu.arrow',
        'actionsMenu.item',
    ]);
    const { classes } = useDropdownStyles({ novuTheme });
    const overrideClasses = {
        arrow: cx(classes.arrow, css(menuArrowStyles)),
        dropdown: cx(classes.dropdown, css(menuDropdownStyles)),
        item: cx(classes.item, css(menuItemStyles)),
        itemIcon: classes.itemIcon,
    };
    function handleNotificationClick() {
        onClick(notification);
    }
    function handleActionButtonClick(actionButtonType) {
        return __awaiter(this, void 0, void 0, function* () {
            onActionClick(notification.templateIdentifier, actionButtonType, notification);
        });
    }
    function handleRemoveMessage(e) {
        e.stopPropagation();
        removeMessage(notification._id);
    }
    function handleToggleReadMessage(e) {
        e.stopPropagation();
        if (unread) {
            markNotificationAsRead(notification._id);
        }
        else {
            markNotificationAsUnRead(notification._id);
        }
    }
    if (listItem) {
        return listItem(notification, handleActionButtonClick, handleNotificationClick);
    }
    return (React.createElement("div", { className: cx('nc-notifications-list-item', unread ? 'nc-notifications-list-item-unread' : 'nc-notifications-list-item-read', listItemClassName, unread ? unreadNotificationStyles(novuTheme) : readNotificationStyles(novuTheme), unread ? css(listItemUnreadStyles) : css(listItemReadStyles)), onClick: () => handleNotificationClick(), "data-test-id": "notification-list-item", role: "button", tabIndex: 0, ref: ref },
        React.createElement(NotificationItemContainer, { className: cx('nc-notifications-list-item-layout', css(listItemLayoutStyles)) },
            React.createElement(NotificationContentContainer, null,
                notification.actor && notification.actor.type !== ActorTypeEnum.NONE && (React.createElement(AvatarContainer, null,
                    React.createElement(RenderAvatar, { actor: notification.actor }))),
                React.createElement(NotificationTextContainer, { className: cx('nc-notifications-list-item-content-layout', css(listItemContentLayoutStyles)) },
                    React.createElement(TextContent, { className: cx('nc-notifications-list-item-title', css(listItemTitleStyles)), "data-test-id": "notification-content", dangerouslySetInnerHTML: {
                            __html: notification.content,
                        } }),
                    React.createElement("div", { className: cx('nc-notifications-list-item-timestamp', timeMarkClassName(novuTheme, unread), css(listItemTimestampStyles)) }, formatRelativeTime({ fromDate: new Date(notification.createdAt), locale: lang })))),
            React.createElement(ActionWrapper, { templateIdentifier: notification.templateIdentifier, actionStatus: (_b = (_a = notification === null || notification === void 0 ? void 0 : notification.cta) === null || _a === void 0 ? void 0 : _a.action) === null || _b === void 0 ? void 0 : _b.status, ctaAction: (_c = notification === null || notification === void 0 ? void 0 : notification.cta) === null || _c === void 0 ? void 0 : _c.action, handleActionButtonClick: handleActionButtonClick })),
        React.createElement(SettingsActionWrapper, { style: { display: allowedNotificationActions ? 'block' : 'none', opacity: hovered ? 1 : 0 }, novuTheme: novuTheme },
            React.createElement(Menu, { radius: 7, shadow: colorScheme === 'dark' ? shadows.dark : shadows.light, withArrow: true, classNames: overrideClasses, withinPortal: true, middlewares: { flip: false, shift: false } },
                React.createElement(Menu.Target, null,
                    React.createElement(ActionIcon, { onClick: (e) => e.stopPropagation(), variant: "transparent", "data-test-id": "notification-dots-button" },
                        React.createElement(DotsHorizontal, { className: cx('nc-notifications-list-item-dots-button', dotsClassName(novuTheme), css(menuDotsButtonStyles)) }))),
                React.createElement(Menu.Dropdown, null,
                    React.createElement(Menu.Item, { icon: React.createElement(Read, null), onClick: handleToggleReadMessage, "data-test-id": unread ? 'notification-mark-as-read' : 'notification-mark-as-unread' }, unread ? t('markAsRead') : t('markAsUnRead')),
                    React.createElement(Menu.Item, { icon: React.createElement(Trash, null), onClick: handleRemoveMessage, "data-test-id": 'notification-remove-message' }, t('removeMessage'))))),
        React.createElement(When, { truthy: readSupportAdded(notification) },
            React.createElement("div", { style: { opacity: !allowedNotificationActions || !hovered ? 1 : 0 } }, !notification.seen && React.createElement(GradientDotWrapper, { colorScheme: colorScheme })))));
}
function ActionWrapper({ actionStatus, templateIdentifier, ctaAction, handleActionButtonClick, }) {
    const { actionsResultBlock } = useNotificationCenter();
    return (React.createElement(React.Fragment, null, actionsResultBlock && actionStatus === MessageActionStatusEnum.DONE ? (actionsResultBlock(templateIdentifier, ctaAction)) : (React.createElement(ActionContainerOrNone, { handleActionButtonClick: handleActionButtonClick, action: ctaAction }))));
}
export const readSupportAdded = (notification) => typeof (notification === null || notification === void 0 ? void 0 : notification.read) !== 'undefined';
function ActionContainerOrNone({ action, handleActionButtonClick, }) {
    return React.createElement(React.Fragment, null, action ? React.createElement(ActionContainer, { onActionClick: handleActionButtonClick, action: action }) : null);
}
function GradientDotWrapper({ colorScheme }) {
    const { bellColors } = getDefaultBellColors({
        colorScheme: colorScheme,
        bellColors: {
            unseenBadgeBackgroundColor: 'transparent',
        },
    });
    const [bellDotStyles] = useStyles('bellButton.dot');
    return (React.createElement(GradientDot, { width: "10px", height: "10px", colors: bellColors, className: cx('nc-bell-button-dot', css(bellDotStyles)) }));
}
function RenderAvatar({ actor }) {
    if ([ActorTypeEnum.USER, ActorTypeEnum.SYSTEM_CUSTOM].includes(actor.type) && actor.data) {
        return (React.createElement(MAvatar, { src: actor.data, radius: "xl" },
            React.createElement(Avatar, null)));
    }
    if (actor.type === ActorTypeEnum.SYSTEM_ICON) {
        const selectedIcon = avatarSystemIcons.filter((data) => data.type === actor.data);
        return selectedIcon.length > 0 ? (React.createElement(SystemIconWrapper, { iconColor: selectedIcon[0].iconColor, containerBgColor: selectedIcon[0].containerBgColor }, selectedIcon[0].icon)) : (React.createElement(Avatar, null));
    }
    return React.createElement(Avatar, null);
}
const NotificationItemContainer = styled.div `
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: normal;
  width: 100%;
`;
const TextContent = styled.div `
  line-height: 16px;
  overflow-wrap: anywhere;
`;
const SettingsActionWrapper = styled.div `
  color: ${({ novuTheme }) => { var _a; return (_a = novuTheme.layout) === null || _a === void 0 ? void 0 : _a.wrapper.secondaryFontColor; }};
`;
const unreadNotificationStyles = (novuTheme) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return css `
  background: ${(_b = (_a = novuTheme === null || novuTheme === void 0 ? void 0 : novuTheme.notificationItem) === null || _a === void 0 ? void 0 : _a.unread) === null || _b === void 0 ? void 0 : _b.background};
  box-shadow: ${(_d = (_c = novuTheme === null || novuTheme === void 0 ? void 0 : novuTheme.notificationItem) === null || _c === void 0 ? void 0 : _c.unread) === null || _d === void 0 ? void 0 : _d.boxShadow};
  color: ${(_f = (_e = novuTheme === null || novuTheme === void 0 ? void 0 : novuTheme.notificationItem) === null || _e === void 0 ? void 0 : _e.unread) === null || _f === void 0 ? void 0 : _f.fontColor};
  font-weight: 700;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 5px;
    border-radius: 7px 0 0 7px;
    background: ${(_h = (_g = novuTheme === null || novuTheme === void 0 ? void 0 : novuTheme.notificationItem) === null || _g === void 0 ? void 0 : _g.unread) === null || _h === void 0 ? void 0 : _h.notificationItemBeforeBrandColor};
  }
`;
};
const readNotificationStyles = (novuTheme) => {
    var _a, _b, _c, _d;
    return css `
  color: ${(_b = (_a = novuTheme === null || novuTheme === void 0 ? void 0 : novuTheme.notificationItem) === null || _a === void 0 ? void 0 : _a.read) === null || _b === void 0 ? void 0 : _b.fontColor};
  background: ${(_d = (_c = novuTheme === null || novuTheme === void 0 ? void 0 : novuTheme.notificationItem) === null || _c === void 0 ? void 0 : _c.read) === null || _d === void 0 ? void 0 : _d.background};
  font-weight: 400;
  font-size: 14px;
`;
};
const listItemClassName = css `
  padding: 15px;
  position: relative;
  display: flex;
  line-height: 20px;
  justify-content: space-between;
  align-items: center;
  border-radius: 7px;
  margin: 10px 15px;

  &:hover {
    cursor: pointer;
  }
`;
const timeMarkClassName = (novuTheme, unread) => {
    var _a, _b, _c, _d;
    return css `
  min-width: 55px;
  font-size: 12px;
  font-weight: 400;
  opacity: 0.5;
  line-height: 14.4px;
  color: ${unread
        ? (_b = (_a = novuTheme === null || novuTheme === void 0 ? void 0 : novuTheme.notificationItem) === null || _a === void 0 ? void 0 : _a.unread) === null || _b === void 0 ? void 0 : _b.timeMarkFontColor
        : (_d = (_c = novuTheme === null || novuTheme === void 0 ? void 0 : novuTheme.notificationItem) === null || _c === void 0 ? void 0 : _c.read) === null || _d === void 0 ? void 0 : _d.timeMarkFontColor};
`;
};
const NotificationContentContainer = styled.div `
  display: flex;
  align-items: center;
  gap: 10px;
`;
const AvatarContainer = styled.div `
  width: 40px;
  min-width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  border: 1px solid ${colors.B40};
  overflow: hidden;
`;
const NotificationTextContainer = styled.div `
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
const SystemIconWrapper = styled.div `
  width: 100%;
  height: 100%;
  cursor: pointer;
  background-color: ${({ containerBgColor }) => containerBgColor};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: ${({ iconColor }) => iconColor};

  & > svg {
    width: 20px;
    height: 20px;
  }
`;
const dotsClassName = (theme) => {
    var _a;
    return css `
  color: ${(_a = theme === null || theme === void 0 ? void 0 : theme.actionsMenu) === null || _a === void 0 ? void 0 : _a.dotsButtonColor};
`;
};
const useDropdownStyles = createStyles((theme, { novuTheme }) => {
    var _a, _b, _c, _d, _e;
    return {
        dropdown: {
            backgroundColor: (_a = novuTheme.actionsMenu) === null || _a === void 0 ? void 0 : _a.dropdownColor,
            border: 'none',
        },
        item: {
            borerRadius: '5px',
            color: (_b = novuTheme.actionsMenu) === null || _b === void 0 ? void 0 : _b.fontColor,
            fontWeight: 400,
            fontSize: '14px',
            '&:hover': {
                background: (_c = novuTheme.actionsMenu) === null || _c === void 0 ? void 0 : _c.hoverColor,
            },
        },
        arrow: {
            backgroundColor: (_d = novuTheme.actionsMenu) === null || _d === void 0 ? void 0 : _d.dropdownColor,
            borderColor: (_e = novuTheme.actionsMenu) === null || _e === void 0 ? void 0 : _e.dropdownColor,
        },
        itemIcon: { width: '20px', height: '20px' },
    };
});
//# sourceMappingURL=NotificationListItem.js.map