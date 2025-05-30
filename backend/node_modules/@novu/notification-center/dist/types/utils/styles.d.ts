import { CSSInterpolation } from '@emotion/css';
import type { ColorScheme, ICommonTheme } from '../index';
import type { INovuTheme } from '../store/novu-theme.context';
import type { INotificationCenterStyles, StylesPaths } from '../store/styles';
export declare const getStyleByPath: ({ styles, path, theme, common, colorScheme, }: {
    styles?: INotificationCenterStyles;
    path: StylesPaths;
    theme: INovuTheme;
    common: ICommonTheme;
    colorScheme: ColorScheme;
}) => CSSInterpolation | undefined;
//# sourceMappingURL=styles.d.ts.map