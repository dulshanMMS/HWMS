import { useContext } from 'react';
import { ThemeContext } from '../store/novu-theme.context';
export function useNovuTheme() {
    const { colorScheme, theme, common } = useContext(ThemeContext);
    return {
        colorScheme,
        theme,
        common,
    };
}
//# sourceMappingURL=useNovuTheme.js.map