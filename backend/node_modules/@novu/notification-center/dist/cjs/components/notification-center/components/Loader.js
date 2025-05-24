"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = void 0;
const react_1 = __importDefault(require("react"));
const core_1 = require("@mantine/core");
const css_1 = require("@emotion/css");
const hooks_1 = require("../../../hooks");
const styles_1 = require("../../../store/styles");
const Loader = ({ color }) => {
    const { theme } = (0, hooks_1.useNovuTheme)();
    const [loaderStyles] = (0, styles_1.useStyles)(['loader.root']);
    const loaderColor = color || theme.loaderColor;
    return (react_1.default.createElement("div", { style: {
            textAlign: 'center',
            minHeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        } },
        react_1.default.createElement(core_1.Loader, { className: (0, css_1.cx)('nc-loader', (0, css_1.css)(loaderStyles)), color: loaderColor })));
};
exports.Loader = Loader;
//# sourceMappingURL=Loader.js.map