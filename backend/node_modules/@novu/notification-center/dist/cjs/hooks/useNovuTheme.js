"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNovuTheme = void 0;
const react_1 = require("react");
const novu_theme_context_1 = require("../store/novu-theme.context");
function useNovuTheme() {
    const { colorScheme, theme, common } = (0, react_1.useContext)(novu_theme_context_1.ThemeContext);
    return {
        colorScheme,
        theme,
        common,
    };
}
exports.useNovuTheme = useNovuTheme;
//# sourceMappingURL=useNovuTheme.js.map