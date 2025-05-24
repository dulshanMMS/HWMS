import React, { createContext, useMemo, useContext } from 'react';
import { useNovuTheme } from '../../hooks';
import { getStyleByPath } from '../../utils/styles';
const StylesContext = createContext(undefined);
export const useStyles = (path) => {
    const stylesContext = useContext(StylesContext);
    const { theme, colorScheme, common } = useNovuTheme();
    if (!stylesContext) {
        throw new Error('useStyles must be used within a StylesProvider');
    }
    if (Array.isArray(path)) {
        return path.map((el) => getStyleByPath({
            styles: stylesContext.styles,
            path: el,
            theme,
            common,
            colorScheme,
        }));
    }
    return [
        getStyleByPath({
            styles: stylesContext.styles,
            path,
            theme,
            common,
            colorScheme,
        }),
    ];
};
export const StylesProvider = ({ styles, children, }) => {
    const contextValue = useMemo(() => ({ styles }), [styles]);
    return React.createElement(StylesContext.Provider, { value: contextValue }, children);
};
//# sourceMappingURL=styles-provider.js.map