var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from 'react';
import { ActionIcon } from '@mantine/core';
import styled from '@emotion/styled';
import { cx, css } from '@emotion/css';
import { colors } from '../../shared/config/colors';
import { Bell as BellIcon, GradientDot } from '../../shared/icons';
import { useNotifications } from '../../hooks';
import { getDefaultBellColors } from '../../utils/defaultTheme';
import { useStyles } from '../../store/styles';
const headerIconsSettings = { color: colors.B60, width: 30, height: 30 };
export function NotificationBell(props) {
    const { unseenCount } = useNotifications();
    const { bellColors } = getDefaultBellColors({
        bellColors: {
            unseenBadgeColor: props === null || props === void 0 ? void 0 : props.unseenBadgeColor,
            unseenBadgeBackgroundColor: props === null || props === void 0 ? void 0 : props.unseenBadgeBackgroundColor,
        },
        colorScheme: props === null || props === void 0 ? void 0 : props.colorScheme,
    });
    const [bellButtonStyles, bellDotStyles] = useStyles(['bellButton.root', 'bellButton.dot']);
    return (React.createElement(ActionIcon, { variant: "transparent", className: cx('nc-bell-button', css(bellButtonStyles)), "data-test-id": "notification-bell" },
        React.createElement(BellIcon, Object.assign({}, headerIconsSettings)),
        unseenCount > 0 ? (React.createElement(StyledGradientDot, { bellColors: bellColors, className: cx('nc-bell-button-dot', css(bellDotStyles)) })) : null));
}
export function GradientDotWrap(_a) {
    var { bellColors } = _a, props = __rest(_a, ["bellColors"]);
    return React.createElement(GradientDot, Object.assign({}, props, { colors: bellColors }));
}
const StyledGradientDot = styled(GradientDotWrap) `
  position: absolute;
  top: -3%;
  right: 10%;
  width: 12px;
  height: 12px;
`;
//# sourceMappingURL=NotificationBell.js.map