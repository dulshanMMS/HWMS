import React from 'react';
import { INovuPopoverTheme, INovuTheme } from './novu-theme.context';
import { ColorScheme } from '../index';
export interface INovuThemePopoverProvider {
    light?: INovuPopoverTheme;
    dark?: INovuPopoverTheme;
    common?: ICommonTheme;
}
export interface INovuThemeProvider {
    light?: INovuTheme;
    dark?: INovuTheme;
    common?: ICommonTheme;
}
export interface ICommonTheme {
    fontFamily?: string;
}
interface INovuThemeProviderProps {
    children: React.ReactNode;
    colorScheme: ColorScheme;
    theme: INovuThemeProvider;
}
export declare function NovuThemeProvider(props: INovuThemeProviderProps): React.JSX.Element;
export {};
//# sourceMappingURL=novu-theme-provider.context.d.ts.map