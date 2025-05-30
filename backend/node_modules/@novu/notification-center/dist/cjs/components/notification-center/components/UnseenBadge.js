"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnseenBadge = void 0;
const react_1 = __importDefault(require("react"));
const core_1 = require("@mantine/core");
const css_1 = require("@emotion/css");
const hooks_1 = require("../../../hooks");
const styles_1 = require("../../../store/styles");
function UnseenBadge({ unseenCount }) {
    var _a, _b;
    const { theme, common } = (0, hooks_1.useNovuTheme)();
    const [unseenBadgeStyles] = (0, styles_1.useStyles)('unseenBadge.root');
    const showUnseenBadge = unseenCount && unseenCount > 0;
    return showUnseenBadge ? (react_1.default.createElement(core_1.Badge, { "data-test-id": "unseen-count-label", sx: {
            padding: 0,
            marginLeft: 10,
            width: 25,
            height: 20,
            pointerEvents: 'none',
            border: 'none',
            background: (_a = theme.header) === null || _a === void 0 ? void 0 : _a.badgeColor,
            fontFamily: common.fontFamily,
            lineHeight: '14px',
            color: (_b = theme.header) === null || _b === void 0 ? void 0 : _b.badgeTextColor,
            fontWeight: 'bold',
            fontSize: '12px',
        }, radius: 10, className: (0, css_1.cx)('nc-unseen-badge', (0, css_1.css)(unseenBadgeStyles)) }, unseenCount > 99 ? '99+' : unseenCount)) : null;
}
exports.UnseenBadge = UnseenBadge;
//# sourceMappingURL=UnseenBadge.js.map