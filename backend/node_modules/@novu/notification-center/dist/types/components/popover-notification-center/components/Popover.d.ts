import React from 'react';
import { PopoverProps } from '@mantine/core';
import { INovuTheme } from '../../../store/novu-theme.context';
interface INovuPopoverProps {
    bell: (props: any) => JSX.Element;
    children: JSX.Element;
    theme: INovuTheme;
    offset?: number;
    position?: PopoverProps['position'];
}
export declare function Popover({ children, bell, theme, offset, position }: INovuPopoverProps): React.JSX.Element;
export {};
//# sourceMappingURL=Popover.d.ts.map