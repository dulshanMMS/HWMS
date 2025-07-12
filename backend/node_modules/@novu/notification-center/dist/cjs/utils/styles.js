"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStyleByPath = void 0;
const get = (obj, path) => path.split('.').reduce((acc, level) => acc && acc[level], obj);
const getStyleByPath = ({ styles, path, theme, common, colorScheme, }) => {
    if (!styles) {
        return;
    }
    const stylePart = get(styles, path);
    return typeof stylePart === 'function' ? stylePart({ theme, common, colorScheme }) : stylePart;
};
exports.getStyleByPath = getStyleByPath;
//# sourceMappingURL=styles.js.map