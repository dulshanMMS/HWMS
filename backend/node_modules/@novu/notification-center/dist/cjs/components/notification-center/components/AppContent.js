"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppContent = void 0;
const react_1 = __importDefault(require("react"));
const core_1 = require("@mantine/core");
const css_1 = require("@emotion/css");
const Layout_1 = require("./layout/Layout");
const hooks_1 = require("../../../hooks");
const hooks_2 = require("../../../hooks");
function AppContent() {
    var _a, _b, _c, _d;
    const { theme, common } = (0, hooks_1.useNovuTheme)();
    const { data: organization } = (0, hooks_2.useFetchOrganization)();
    const primaryColor = (_b = (_a = organization === null || organization === void 0 ? void 0 : organization.branding) === null || _a === void 0 ? void 0 : _a.color) !== null && _b !== void 0 ? _b : theme.loaderColor;
    const fontFamily = common.fontFamily || ((_c = organization === null || organization === void 0 ? void 0 : organization.branding) === null || _c === void 0 ? void 0 : _c.fontFamily);
    const dir = (((_d = organization === null || organization === void 0 ? void 0 : organization.branding) === null || _d === void 0 ? void 0 : _d.direction) === 'rtl' ? 'rtl' : 'ltr');
    const themeConfig = {
        fontFamily,
        dir,
    };
    return (react_1.default.createElement(core_1.MantineProvider, { theme: themeConfig },
        react_1.default.createElement("div", { className: wrapperClassName(primaryColor, fontFamily, dir) },
            react_1.default.createElement(Layout_1.Layout, null))));
}
exports.AppContent = AppContent;
const wrapperClassName = (primaryColor, fontFamily, dir) => (0, css_1.css) `
  margin: 0;
  font-family: ${fontFamily === 'inherit' ? fontFamily : `${fontFamily}, Helvetica, sans-serif`};
  color: #333737;
  direction: ${dir};
  width: 420px;
  z-index: 999;

  ::-moz-selection {
    background: ${primaryColor};
  }

  *::selection {
    background: ${primaryColor};
  }
`;
//# sourceMappingURL=AppContent.js.map