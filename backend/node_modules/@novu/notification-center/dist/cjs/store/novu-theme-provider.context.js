"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovuThemeProvider = void 0;
const react_1 = __importDefault(require("react"));
const novu_theme_context_1 = require("./novu-theme.context");
const defaultTheme_1 = require("../utils/defaultTheme");
function NovuThemeProvider(props) {
    const { theme, common } = (0, defaultTheme_1.getDefaultTheme)({ colorScheme: props.colorScheme, theme: props.theme });
    return (react_1.default.createElement(novu_theme_context_1.ThemeContext.Provider, { value: { colorScheme: props.colorScheme, theme: Object.assign({}, theme), common: Object.assign({}, common) } }, props.children));
}
exports.NovuThemeProvider = NovuThemeProvider;
//# sourceMappingURL=novu-theme-provider.context.js.map