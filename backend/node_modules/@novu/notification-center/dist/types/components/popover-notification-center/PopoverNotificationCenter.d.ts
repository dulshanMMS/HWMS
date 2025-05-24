import React from 'react';
import { PopoverProps } from '@mantine/core';
import { IMessage, IMessageAction, ButtonTypeEnum } from '@novu/shared';
import { IUserPreferenceSettings } from '@novu/client';
import { INotificationBellProps } from '../notification-bell';
import { ColorScheme, INovuThemePopoverProvider } from '../../index';
import { ITab, ListItem } from '../../shared/interfaces';
export interface IPopoverNotificationCenterProps {
    onUrlChange?: (url: string) => void;
    onNotificationClick?: (notification: IMessage) => void;
    onUnseenCountChanged?: (unseenCount: number) => void;
    children: (props: INotificationBellProps) => JSX.Element;
    onActionClick?: (templateIdentifier: string, type: ButtonTypeEnum, message: IMessage) => void;
    actionsResultBlock?: (templateIdentifier: string, messageAction: IMessageAction) => JSX.Element;
    preferenceFilter?: (userPreference: IUserPreferenceSettings) => boolean;
    header?: () => JSX.Element;
    footer?: () => JSX.Element;
    emptyState?: JSX.Element;
    listItem?: ListItem;
    colorScheme: ColorScheme;
    theme?: INovuThemePopoverProvider;
    tabs?: ITab[];
    showUserPreferences?: boolean;
    allowedNotificationActions?: boolean;
    onTabClick?: (tab: ITab) => void;
    offset?: number;
    position?: PopoverProps['position'];
}
export declare function PopoverNotificationCenter({ children, ...props }: IPopoverNotificationCenterProps): React.JSX.Element;
//# sourceMappingURL=PopoverNotificationCenter.d.ts.map