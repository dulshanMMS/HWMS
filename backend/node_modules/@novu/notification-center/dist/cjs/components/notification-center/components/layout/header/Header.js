"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
const react_1 = __importStar(require("react"));
const css_1 = require("@emotion/css");
const styled_1 = __importDefault(require("@emotion/styled"));
const core_1 = require("@mantine/core");
const hooks_1 = require("../../../../../hooks");
const icons_1 = require("../../../../../shared/icons");
const notification_center_context_1 = require("../../../../../store/notification-center.context");
const styles_1 = require("../../../../../store/styles");
const UnseenBadge_1 = require("../../UnseenBadge");
function Header({ onCogClick }) {
    var _a;
    const [allRead, setAllRead] = (0, react_1.useState)(true);
    const { markAllNotificationsAsRead, notifications, unseenCount } = (0, hooks_1.useNotifications)();
    const { theme } = (0, hooks_1.useNovuTheme)();
    const { tabs, showUserPreferences } = (0, react_1.useContext)(notification_center_context_1.NotificationCenterContext);
    const { t } = (0, hooks_1.useTranslations)();
    const [headerStyles, headerTitleStyles, headerMarkAsReadStyles, headerCogStyles] = (0, styles_1.useStyles)([
        'header.root',
        'header.title',
        'header.markAsRead',
        'header.cog',
    ]);
    (0, react_1.useEffect)(() => {
        if (notifications) {
            const read = notifications.some((msg) => msg.read === false);
            setAllRead(read);
        }
    }, [notifications]);
    return (react_1.default.createElement("div", { className: (0, css_1.cx)('nc-header', headerClassName, (0, css_1.css)(headerStyles)) },
        react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' } },
            react_1.default.createElement("div", { className: (0, css_1.cx)('nc-header-title', titleClassName(theme.header.fontColor), (0, css_1.css)(headerTitleStyles)), "data-test-id": "notifications-header-title" }, t('notifications')),
            !tabs && react_1.default.createElement(UnseenBadge_1.UnseenBadge, { unseenCount: unseenCount })),
        react_1.default.createElement(ActionItems, null,
            react_1.default.createElement("div", { className: (0, css_1.cx)('nc-header-mark-as-read', markAsReadClassName(!allRead, (_a = theme.header) === null || _a === void 0 ? void 0 : _a.markAllAsReadButtonColor), (0, css_1.css)(headerMarkAsReadStyles)), onClick: markAllNotificationsAsRead, role: "button", tabIndex: 0, "data-test-id": "notifications-header-mark-all-as-read" }, t('markAllAsRead')),
            react_1.default.createElement("div", { style: { display: showUserPreferences ? 'inline-block' : 'none' } },
                react_1.default.createElement(core_1.ActionIcon, { "data-test-id": "user-preference-cog", variant: "transparent", onClick: onCogClick },
                    react_1.default.createElement(icons_1.Cogs, { className: (0, css_1.cx)('nc-header-cog', cogClassName(theme), (0, css_1.css)(headerCogStyles)) }))))));
}
exports.Header = Header;
const headerClassName = (0, css_1.css) `
  padding: 5px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 55px;
`;
const ActionItems = styled_1.default.div `
  display: flex;
  align-items: center;
`;
const cogClassName = (theme) => {
    var _a;
    return (0, css_1.css) `
  color: ${(_a = theme === null || theme === void 0 ? void 0 : theme.userPreferences) === null || _a === void 0 ? void 0 : _a.settingsButtonColor};
`;
};
const titleClassName = (fontColor) => (0, css_1.css) `
  color: ${fontColor};
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  text-align: center;
`;
const markAsReadClassName = (disabled, fontColor) => (0, css_1.css) `
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