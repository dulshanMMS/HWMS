"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeContext = void 0;
const react_1 = __importDefault(require("react"));
exports.ThemeContext = react_1.default.createContext({
    colorScheme: 'light',
    theme: null,
    common: null,
});
//# sourceMappingURL=novu-theme.context.js.map