"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultNotificationBellDarkTheme = exports.defaultNotificationBellLightTheme = exports.defaultCommonTheme = exports.defaultDarkTheme = exports.defaultLightTheme = void 0;
const shared_1 = require("@novu/shared");
const colors_1 = require("./colors");
const shadows_1 = require("./shadows");
const defaultLightTheme = {
    layout: {
        background: colors_1.colors.white,
        boxShadow: shadows_1.shadows.medium,
        wrapper: {
            secondaryFontColor: colors_1.colors.B80,
        },
    },
    header: {
        fontColor: colors_1.colors.B40,
        badgeColor: colors_1.colors.vertical,
        badgeTextColor: colors_1.colors.white,
        markAllAsReadButtonColor: colors_1.colors.B60,
    },
    popover: { arrowColor: colors_1.colors.white },
    actionsMenu: {
        dropdownColor: colors_1.colors.white,
        hoverColor: colors_1.colors.B98,
        fontColor: colors_1.colors.B40,
        dotsButtonColor: colors_1.colors.B70,
    },
    notificationItem: {
        read: { background: colors_1.colors.B98, fontColor: colors_1.colors.B60, timeMarkFontColor: colors_1.colors.B80 },
        unread: {
            background: colors_1.colors.white,
            fontColor: colors_1.colors.B40,
            boxShadow: shadows_1.shadows.medium,
            notificationItemBeforeBrandColor: colors_1.colors.vertical,
            timeMarkFontColor: colors_1.colors.B60,
        },
        buttons: shared_1.lightButtonStyle,
    },
    userPreferences: {
        settingsButtonColor: colors_1.colors.B70,
        accordion: {
            background: colors_1.colors.white,
            fontColor: colors_1.colors.B40,
            secondaryFontColor: colors_1.colors.B60,
            boxShadow: shadows_1.shadows.medium,
            arrowColor: colors_1.colors.B60,
            dividerColor: colors_1.colors.BGLight,
        },
        accordionItem: {
            fontColor: { active: colors_1.colors.B40, inactive: colors_1.colors.B80 },
            icon: { active: colors_1.colors.B40, inactive: colors_1.colors.B80 },
            switch: {
                backgroundChecked: colors_1.colors.vertical,
                backgroundUnchecked: colors_1.colors.B80,
            },
        },
    },
    footer: { logoTextColor: 'black', logoPrefixFontColor: colors_1.colors.B70 },
    loaderColor: colors_1.colors.loader,
};
exports.defaultLightTheme = defaultLightTheme;
const defaultDarkTheme = {
    layout: {
        background: colors_1.colors.B15,
        boxShadow: shadows_1.shadows.dark,
        wrapper: {
            secondaryFontColor: colors_1.colors.B40,
        },
    },
    header: {
        fontColor: colors_1.colors.white,
        badgeColor: colors_1.colors.vertical,
        badgeTextColor: colors_1.colors.white,
        markAllAsReadButtonColor: colors_1.colors.B60,
    },
    popover: { arrowColor: colors_1.colors.B15 },
    actionsMenu: {
        dropdownColor: colors_1.colors.B20,
        hoverColor: colors_1.colors.B30,
        fontColor: colors_1.colors.white,
        dotsButtonColor: colors_1.colors.B40,
    },
    notificationItem: {
        read: { background: colors_1.colors.B17, fontColor: colors_1.colors.white, timeMarkFontColor: colors_1.colors.B40 },
        unread: {
            background: colors_1.colors.B20,
            fontColor: colors_1.colors.white,
            boxShadow: shadows_1.shadows.dark,
            notificationItemBeforeBrandColor: colors_1.colors.vertical,
            timeMarkFontColor: colors_1.colors.B60,
        },
        buttons: shared_1.darkButtonStyle,
    },
    userPreferences: {
        settingsButtonColor: colors_1.colors.B40,
        accordion: {
            background: colors_1.colors.B20,
            fontColor: colors_1.colors.white,
            secondaryFontColor: colors_1.colors.B60,
            boxShadow: shadows_1.shadows.dark,
            arrowColor: colors_1.colors.B60,
            dividerColor: colors_1.colors.B30,
        },
        accordionItem: {
            fontColor: { active: colors_1.colors.white, inactive: colors_1.colors.B60 },
            icon: { active: colors_1.colors.white, inactive: colors_1.colors.B40 },
            switch: {
                backgroundChecked: colors_1.colors.vertical,
                backgroundUnchecked: colors_1.colors.B30,
            },
        },
    },
    footer: { logoTextColor: colors_1.colors.white, logoPrefixFontColor: colors_1.colors.B40 },
    loaderColor: colors_1.colors.loader,
};
exports.defaultDarkTheme = defaultDarkTheme;
const defaultCommonTheme = {
    fontFamily: 'inherit',
};
exports.defaultCommonTheme = defaultCommonTheme;
const defaultNotificationBellLightTheme = {
    unseenBadgeColor: { stopColor: '#FF512F', stopColorOffset: '#DD2476' },
    unseenBadgeBackgroundColor: colors_1.colors.white,
};
exports.defaultNotificationBellLightTheme = defaultNotificationBellLightTheme;
const defaultNotificationBellDarkTheme = {
    unseenBadgeColor: { stopColor: '#FF512F', stopColorOffset: '#DD2476' },
    unseenBadgeBackgroundColor: colors_1.colors.B15,
};
exports.defaultNotificationBellDarkTheme = defaultNotificationBellDarkTheme;
//# sourceMappingURL=themeDefaultValues.js.map