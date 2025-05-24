"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradientDotWrap = exports.NotificationBell = void 0;
const react_1 = __importDefault(require("react"));
const core_1 = require("@mantine/core");
const styled_1 = __importDefault(require("@emotion/styled"));
const css_1 = require("@emotion/css");
const colors_1 = require("../../shared/config/colors");
const icons_1 = require("../../shared/icons");
const hooks_1 = require("../../hooks");
const defaultTheme_1 = require("../../utils/defaultTheme");
const styles_1 = require("../../store/styles");
const headerIconsSettings = { color: colors_1.colors.B60, width: 30, height: 30 };
function NotificationBell(props) {
    const { unseenCount } = (0, hooks_1.useNotifications)();
    const { bellColors } = (0, defaultTheme_1.getDefaultBellColors)({
        bellColors: {
            unseenBadgeColor: props === null || props === void 0 ? void 0 : props.unseenBadgeColor,
            unseenBadgeBackgroundColor: props === null || props === void 0 ? void 0 : props.unseenBadgeBackgroundColor,
        },
        colorScheme: props === null || props === void 0 ? void 0 : props.colorScheme,
    });
    const [bellButtonStyles, bellDotStyles] = (0, styles_1.useStyles)(['bellButton.root', 'bellButton.dot']);
    return (react_1.default.createElement(core_1.ActionIcon, { variant: "transparent", className: (0, css_1.cx)('nc-bell-button', (0, css_1.css)(bellButtonStyles)), "data-test-id": "notification-bell" },
        react_1.default.createElement(icons_1.Bell, Object.assign({}, headerIconsSettings)),
        unseenCount > 0 ? (react_1.default.createElement(StyledGradientDot, { bellColors: bellColors, className: (0, css_1.cx)('nc-bell-button-dot', (0, css_1.css)(bellDotStyles)) })) : null));
}
exports.NotificationBell = NotificationBell;
function GradientDotWrap(_a) {
    var { bellColors } = _a, props = __rest(_a, ["bellColors"]);
    return react_1.default.createElement(icons_1.GradientDot, Object.assign({}, props, { colors: bellColors }));
}
exports.GradientDotWrap = GradientDotWrap;
const StyledGradientDot = (0, styled_1.default)(GradientDotWrap) `
  position: absolute;
  top: -3%;
  right: 10%;
  width: 12px;
  height: 12px;
`;
//# sourceMappingURL=NotificationBell.js.map