import { ICommonTheme, INovuThemeProvider } from '../store/novu-theme-provider.context';
import { INotificationBellColors, INovuTheme } from '../store/novu-theme.context';
import { ColorScheme } from '../index';
interface IDefaultThemeProps {
    colorScheme?: ColorScheme;
    theme?: INovuThemeProvider;
}
export declare function getDefaultTheme(props: IDefaultThemeProps): {
    theme: INovuTheme;
    common: ICommonTheme;
};
interface IDefaultBellColors {
    colorScheme?: ColorScheme;
    bellColors: INotificationBellColors;
}
export declare function getDefaultBellColors(props: IDefaultBellColors): {
    bellColors: INotificationBellColors;
};
export {};
//# sourceMappingURL=defaultTheme.d.ts.map