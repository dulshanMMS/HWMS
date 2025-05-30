import { MantineTheme } from '@mantine/core';
import { INovuTheme } from '../../../../../store/novu-theme.context';
import { ICommonTheme } from '../../../../../store/novu-theme-provider.context';
declare const _default: (params: {
    novuTheme: INovuTheme;
    common: ICommonTheme;
    colorScheme: 'light' | 'dark';
}, options?: import("@mantine/core").UseStylesOptions<string>) => {
    classes: {
        tabsList: string;
        tab: string;
        tabLabel: string;
        tabIcon: string;
    };
    cx: (...args: any) => string;
    theme: MantineTheme;
};
export default _default;
//# sourceMappingURL=Tabs.styles.d.ts.map