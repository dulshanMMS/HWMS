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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylesProvider = exports.useStyles = void 0;
const react_1 = __importStar(require("react"));
const hooks_1 = require("../../hooks");
const styles_1 = require("../../utils/styles");
const StylesContext = (0, react_1.createContext)(undefined);
const useStyles = (path) => {
    const stylesContext = (0, react_1.useContext)(StylesContext);
    const { theme, colorScheme, common } = (0, hooks_1.useNovuTheme)();
    if (!stylesContext) {
        throw new Error('useStyles must be used within a StylesProvider');
    }
    if (Array.isArray(path)) {
        return path.map((el) => (0, styles_1.getStyleByPath)({
            styles: stylesContext.styles,
            path: el,
            theme,
            common,
            colorScheme,
        }));
    }
    return [
        (0, styles_1.getStyleByPath)({
            styles: stylesContext.styles,
            path,
            theme,
            common,
            colorScheme,
        }),
    ];
};
exports.useStyles = useStyles;
const StylesProvider = ({ styles, children, }) => {
    const contextValue = (0, react_1.useMemo)(() => ({ styles }), [styles]);
    return react_1.default.createElement(StylesContext.Provider, { value: contextValue }, children);
};
exports.StylesProvider = StylesProvider;
//# sourceMappingURL=styles-provider.js.map