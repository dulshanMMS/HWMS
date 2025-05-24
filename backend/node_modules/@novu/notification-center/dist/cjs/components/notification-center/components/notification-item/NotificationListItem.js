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
exports.readSupportAdded = exports.NotificationListItem = void 0;
const react_1 = __importDefault(require("react"));
const core_1 = require("@mantine/core");
const hooks_1 = require("@mantine/hooks");
const css_1 = require("@emotion/css");
const styled_1 = __importDefault(require("@emotion/styled"));
const shared_1 = require("@novu/shared");
const hooks_2 = require("../../../../hooks");
const defaultTheme_1 = require("../../../../utils/defaultTheme");
const ActionContainer_1 = require("./ActionContainer");
const When_1 = require("../../../../shared/utils/When");
const shadows_1 = require("../../../../shared/config/shadows");
const icons_1 = require("../../../../shared/icons");
const colors_1 = require("../../../../shared/config/colors");
const styles_1 = require("../../../../store/styles");
const date_1 = require("../../../../utils/date");
const avatarSystemIcons = [
    {
        icon: react_1.default.createElement(icons_1.Warning, null),
        type: shared_1.SystemAvatarIconEnum.WARNING,
        iconColor: '#FFF000',
        containerBgColor: '#FFF00026',
    },
    {
        icon: react_1.default.createElement(icons_1.Info, null),
        type: shared_1.SystemAvatarIconEnum.INFO,
        iconColor: '#0000FF',
        containerBgColor: '#0000FF26',
    },
    {
        icon: react_1.default.createElement(icons_1.Up, null),
        type: shared_1.SystemAvatarIconEnum.UP,
        iconColor: colors_1.colors.B70,
        containerBgColor: `${colors_1.colors.B70}26`,
    },
    {
        icon: react_1.default.createElement(icons_1.Question, null),
        type: shared_1.SystemAvatarIconEnum.QUESTION,
        iconColor: colors_1.colors.B70,
        containerBgColor: `${colors_1.colors.B70}26`,
    },
    {
        icon: react_1.default.createElement(icons_1.Success, null),
        type: shared_1.SystemAvatarIconEnum.SUCCESS,
        iconColor: colors_1.colors.success,
        containerBgColor: `${colors_1.colors.success}26`,
    },
    {
        icon: react_1.default.createElement(icons_1.ErrorIcon, null),
        type: shared_1.SystemAvatarIconEnum.ERROR,
        iconColor: colors_1.colors.error,
        containerBgColor: `${colors_1.colors.error}26`,
    },
];
function NotificationListItem({ notification, onClick, }) {
    var _a, _b, _c;
    const { theme: novuTheme, colorScheme } = (0, hooks_2.useNovuTheme)();
    const { onActionClick, listItem, allowedNotificationActions } = (0, hooks_2.useNotificationCenter)();
    const { removeMessage, markNotificationAsRead, markNotificationAsUnRead } = (0, hooks_2.useNotifications)();
    const { t, lang } = (0, hooks_2.useTranslations)();
    const { hovered, ref } = (0, hooks_1.useHover)();
    const unread = (0, exports.readSupportAdded)(notification) ? !notification.read : !notification.seen;
    const [listItemReadStyles, listItemUnreadStyles, listItemLayoutStyles, listItemContentLayoutStyles, listItemTitleStyles, listItemTimestampStyles, menuDotsButtonStyles, menuDropdownStyles, menuArrowStyles, menuItemStyles,] = (0, styles_1.useStyles)([
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
        arrow: (0, css_1.cx)(classes.arrow, (0, css_1.css)(menuArrowStyles)),
        dropdown: (0, css_1.cx)(classes.dropdown, (0, css_1.css)(menuDropdownStyles)),
        item: (0, css_1.cx)(classes.item, (0, css_1.css)(menuItemStyles)),
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
    return (react_1.default.createElement("div", { className: (0, css_1.cx)('nc-notifications-list-item', unread ? 'nc-notifications-list-item-unread' : 'nc-notifications-list-item-read', listItemClassName, unread ? unreadNotificationStyles(novuTheme) : readNotificationStyles(novuTheme), unread ? (0, css_1.css)(listItemUnreadStyles) : (0, css_1.css)(listItemReadStyles)), onClick: () => handleNotificationClick(), "data-test-id": "notification-list-item", role: "button", tabIndex: 0, ref: ref },
        react_1.default.createElement(NotificationItemContainer, { className: (0, css_1.cx)('nc-notifications-list-item-layout', (0, css_1.css)(listItemLayoutStyles)) },
            react_1.default.createElement(NotificationContentContainer, null,
                notification.actor && notification.actor.type !== shared_1.ActorTypeEnum.NONE && (react_1.default.createElement(AvatarContainer, null,
                    react_1.default.createElement(RenderAvatar, { actor: notification.actor }))),
                react_1.default.createElement(NotificationTextContainer, { className: (0, css_1.cx)('nc-notifications-list-item-content-layout', (0, css_1.css)(listItemContentLayoutStyles)) },
                    react_1.default.createElement(TextContent, { className: (0, css_1.cx)('nc-notifications-list-item-title', (0, css_1.css)(listItemTitleStyles)), "data-test-id": "notification-content", dangerouslySetInnerHTML: {
                            __html: notification.content,
                        } }),
                    react_1.default.createElement("div", { className: (0, css_1.cx)('nc-notifications-list-item-timestamp', timeMarkClassName(novuTheme, unread), (0, css_1.css)(listItemTimestampStyles)) }, (0, date_1.formatRelativeTime)({ fromDate: new Date(notification.createdAt), locale: lang })))),
            react_1.default.createElement(ActionWrapper, { templateIdentifier: notification.templateIdentifier, actionStatus: (_b = (_a = notification === null || notification === void 0 ? void 0 : notification.cta) === null || _a === void 0 ? void 0 : _a.action) === null || _b === void 0 ? void 0 : _b.status, ctaAction: (_c = notification === null || notification === void 0 ? void 0 : notification.cta) === null || _c === void 0 ? void 0 : _c.action, handleActionButtonClick: handleActionButtonClick })),
        react_1.default.createElement(SettingsActionWrapper, { style: { display: allowedNotificationActions ? 'block' : 'none', opacity: hovered ? 1 : 0 }, novuTheme: novuTheme },
            react_1.default.createElement(core_1.Menu, { radius: 7, shadow: colorScheme === 'dark' ? shadows_1.shadows.dark : shadows_1.shadows.light, withArrow: true, classNames: overrideClasses, withinPortal: true, middlewares: { flip: false, shift: false } },
                react_1.default.createElement(core_1.Menu.Target, null,
                    react_1.default.createElement(core_1.ActionIcon, { onClick: (e) => e.stopPropagation(), variant: "transparent", "data-test-id": "notification-dots-button" },
                        react_1.default.createElement(icons_1.DotsHorizontal, { className: (0, css_1.cx)('nc-notifications-list-item-dots-button', dotsClassName(novuTheme), (0, css_1.css)(menuDotsButtonStyles)) }))),
                react_1.default.createElement(core_1.Menu.Dropdown, null,
                    react_1.default.createElement(core_1.Menu.Item, { icon: react_1.default.createElement(icons_1.Read, null), onClick: handleToggleReadMessage, "data-test-id": unread ? 'notification-mark-as-read' : 'notification-mark-as-unread' }, unread ? t('markAsRead') : t('markAsUnRead')),
                    react_1.default.createElement(core_1.Menu.Item, { icon: react_1.default.createElement(icons_1.Trash, null), onClick: handleRemoveMessage, "data-test-id": 'notification-remove-message' }, t('removeMessage'))))),
        react_1.default.createElement(When_1.When, { truthy: (0, exports.readSupportAdded)(notification) },
            react_1.default.createElement("div", { style: { opacity: !allowedNotificationActions || !hovered ? 1 : 0 } }, !notification.seen && react_1.default.createElement(GradientDotWrapper, { colorScheme: colorScheme })))));
}
exports.NotificationListItem = NotificationListItem;
function ActionWrapper({ actionStatus, templateIdentifier, ctaAction, handleActionButtonClick, }) {
    const { actionsResultBlock } = (0, hooks_2.useNotificationCenter)();
    return (react_1.default.createElement(react_1.default.Fragment, null, actionsResultBlock && actionStatus === shared_1.MessageActionStatusEnum.DONE ? (actionsResultBlock(templateIdentifier, ctaAction)) : (react_1.default.createElement(ActionContainerOrNone, { handleActionButtonClick: handleActionButtonClick, action: ctaAction }))));
}
const readSupportAdded = (notification) => typeof (notification === null || notification === void 0 ? void 0 : notification.read) !== 'undefined';
exports.readSupportAdded = readSupportAdded;
function ActionContainerOrNone({ action, handleActionButtonClick, }) {
    return react_1.default.createElement(react_1.default.Fragment, null, action ? react_1.default.createElement(ActionContainer_1.ActionContainer, { onActionClick: handleActionButtonClick, action: action }) : null);
}
function GradientDotWrapper({ colorScheme }) {
    const { bellColors } = (0, defaultTheme_1.getDefaultBellColors)({
        colorScheme: colorScheme,
        bellColors: {
            unseenBadgeBackgroundColor: 'transparent',
        },
    });
    const [bellDotStyles] = (0, styles_1.useStyles)('bellButton.dot');
    return (react_1.default.createElement(icons_1.GradientDot, { width: "10px", height: "10px", colors: bellColors, className: (0, css_1.cx)('nc-bell-button-dot', (0, css_1.css)(bellDotStyles)) }));
}
function RenderAvatar({ actor }) {
    if ([shared_1.ActorTypeEnum.USER, shared_1.ActorTypeEnum.SYSTEM_CUSTOM].includes(actor.type) && actor.data) {
        return (react_1.default.createElement(core_1.Avatar, { src: actor.data, radius: "xl" },
            react_1.default.createElement(icons_1.Avatar, null)));
    }
    if (actor.type === shared_1.ActorTypeEnum.SYSTEM_ICON) {
        const selectedIcon = avatarSystemIcons.filter((data) => data.type === actor.data);
        return selectedIcon.length > 0 ? (react_1.default.createElement(SystemIconWrapper, { iconColor: selectedIcon[0].iconColor, containerBgColor: selectedIcon[0].containerBgColor }, selectedIcon[0].icon)) : (react_1.default.createElement(icons_1.Avatar, null));
    }
    return react_1.default.createElement(icons_1.Avatar, null);
}
const NotificationItemContainer = styled_1.default.div `
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: normal;
  width: 100%;
`;
const TextContent = styled_1.default.div `
  line-height: 16px;
  overflow-wrap: anywhere;
`;
const SettingsActionWrapper = styled_1.default.div `
  color: ${({ novuTheme }) => { var _a; return (_a = novuTheme.layout) === null || _a === void 0 ? void 0 : _a.wrapper.secondaryFontColor; }};
`;
const unreadNotificationStyles = (novuTheme) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return (0, css_1.css) `
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
    return (0, css_1.css) `
  color: ${(_b = (_a = novuTheme === null || novuTheme === void 0 ? void 0 : novuTheme.notificationItem) === null || _a === void 0 ? void 0 : _a.read) === null || _b === void 0 ? void 0 : _b.fontColor};
  background: ${(_d = (_c = novuTheme === null || novuTheme === void 0 ? void 0 : novuTheme.notificationItem) === null || _c === void 0 ? void 0 : _c.read) === null || _d === void 0 ? void 0 : _d.background};
  font-weight: 400;
  font-size: 14px;
`;
};
const listItemClassName = (0, css_1.css) `
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
    return (0, css_1.css) `
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
const NotificationContentContainer = styled_1.default.div `
  display: flex;
  align-items: center;
  gap: 10px;
`;
const AvatarContainer = styled_1.default.div `
  width: 40px;
  min-width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  border: 1px solid ${colors_1.colors.B40};
  overflow: hidden;
`;
const NotificationTextContainer = styled_1.default.div `
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
const SystemIconWrapper = styled_1.default.div `
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
    return (0, css_1.css) `
  color: ${(_a = theme === null || theme === void 0 ? void 0 : theme.actionsMenu) === null || _a === void 0 ? void 0 : _a.dotsButtonColor};
`;
};
const useDropdownStyles = (0, core_1.createStyles)((theme, { novuTheme }) => {
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