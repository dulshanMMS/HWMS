"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferenceHeader = void 0;
const react_1 = __importDefault(require("react"));
const core_1 = require("@mantine/core");
const css_1 = require("@emotion/css");
const icons_1 = require("../../../../../shared/icons");
const hooks_1 = require("../../../../../hooks");
const styles_1 = require("../../../../../store/styles");
function UserPreferenceHeader({ onBackClick }) {
    const { theme } = (0, hooks_1.useNovuTheme)();
    const { t } = (0, hooks_1.useTranslations)();
    const [headerStyles, headerTitleStyles, backButtonStyles] = (0, styles_1.useStyles)([
        'header.root',
        'header.title',
        'header.backButton',
    ]);
    return (react_1.default.createElement("div", { className: (0, css_1.cx)('nc-header', headerClassName, (0, css_1.css)(headerStyles)) },
        react_1.default.createElement(core_1.ActionIcon, { className: (0, css_1.cx)('nc-header-back-button', (0, css_1.css) `
            color: ${theme.header.fontColor};
          `, (0, css_1.css)(backButtonStyles)), "data-test-id": "go-back-btn", variant: "transparent", onClick: onBackClick },
            react_1.default.createElement(icons_1.ArrowLeft, { style: { marginLeft: '15px' } })),
        react_1.default.createElement("div", { className: (0, css_1.cx)('nc-header-title', titleClassName(theme.header.fontColor), (0, css_1.css)(headerTitleStyles)) }, t('settings'))));
}
exports.UserPreferenceHeader = UserPreferenceHeader;
const titleClassName = (fontColor) => (0, css_1.css) `
  color: ${fontColor};
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  text-align: left;
`;
const headerClassName = (0, css_1.css) `
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 55px;
  gap: 10px;
`;
//# sourceMappingURL=UserPreferenceHeader.js.map