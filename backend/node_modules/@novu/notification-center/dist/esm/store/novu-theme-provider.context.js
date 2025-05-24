import React from 'react';
import { ThemeContext } from './novu-theme.context';
import { getDefaultTheme } from '../utils/defaultTheme';
export function NovuThemeProvider(props) {
    const { theme, common } = getDefaultTheme({ colorScheme: props.colorScheme, theme: props.theme });
    return (React.createElement(ThemeContext.Provider, { value: { colorScheme: props.colorScheme, theme: Object.assign({}, theme), common: Object.assign({}, common) } }, props.children));
}
//# sourceMappingURL=novu-theme-provider.context.js.map