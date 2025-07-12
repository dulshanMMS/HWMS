const get = (obj, path) => path.split('.').reduce((acc, level) => acc && acc[level], obj);
export const getStyleByPath = ({ styles, path, theme, common, colorScheme, }) => {
    if (!styles) {
        return;
    }
    const stylePart = get(styles, path);
    return typeof stylePart === 'function' ? stylePart({ theme, common, colorScheme }) : stylePart;
};
//# sourceMappingURL=styles.js.map