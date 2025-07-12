import React from 'react';
import { ColorScheme } from '../../shared/config/colors';
import type { ISvgStopColor } from '../../store/novu-theme.context';
export interface INotificationBellProps {
    unseenCount?: number;
    unseenBadgeColor?: string | ISvgStopColor;
    unseenBadgeBackgroundColor?: string;
    colorScheme?: ColorScheme;
}
export declare function NotificationBell(props: INotificationBellProps): React.JSX.Element;
export declare function GradientDotWrap({ bellColors, ...props }: {
    [x: string]: any;
    bellColors: any;
}): React.JSX.Element;
//# sourceMappingURL=NotificationBell.d.ts.map