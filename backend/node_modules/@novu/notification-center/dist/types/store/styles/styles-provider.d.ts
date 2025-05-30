import { FunctionComponent, PropsWithChildren } from 'react';
import { CSSInterpolation } from '@emotion/css';
import type { INotificationCenterStyles, StylesPaths } from './styles-provider.types';
export declare const useStyles: (path: StylesPaths | StylesPaths[]) => CSSInterpolation[];
export declare const StylesProvider: FunctionComponent<PropsWithChildren<{
    styles?: INotificationCenterStyles;
}>>;
//# sourceMappingURL=styles-provider.d.ts.map