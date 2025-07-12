import React from 'react';
import { IMessage, IMessageAction, ButtonTypeEnum } from '@novu/shared';
import { IUserPreferenceSettings } from '@novu/client';
import { ITab, ListItem, ScreensEnum } from '../../shared/interfaces';
import { ColorScheme } from '../../shared/config/colors';
import { INovuThemeProvider } from '../../store/novu-theme-provider.context';
export interface INotificationCenterProps {
    onUrlChange?: (url: string) => void;
    onNotificationClick?: (notification: IMessage) => void;
    onUnseenCountChanged?: (unseenCount: number) => void;
    onActionClick?: (templateIdentifier: string, type: ButtonTypeEnum, message: IMessage) => void;
    actionsResultBlock?: (templateIdentifier: string, messageAction: IMessageAction) => JSX.Element;
    preferenceFilter?: (userPreference: IUserPreferenceSettings) => boolean;
    header?: ({ setScreen, screen }: {
        setScreen: (screen: ScreensEnum) => void;
        screen: ScreensEnum;
    }) => JSX.Element;
    footer?: () => JSX.Element;
    emptyState?: JSX.Element;
    listItem?: ListItem;
    colorScheme: ColorScheme;
    theme?: INovuThemeProvider;
    tabs?: ITab[];
    showUserPreferences?: boolean;
    allowedNotificationActions?: boolean;
    onTabClick?: (tab: ITab) => void;
}
export declare function NotificationCenter({ onUnseenCountChanged, onUrlChange, onNotificationClick, onActionClick, preferenceFilter, header, footer, emptyState, listItem, actionsResultBlock, tabs, showUserPreferences, allowedNotificationActions, onTabClick, colorScheme, theme, }: INotificationCenterProps): React.JSX.Element;
//# sourceMappingURL=NotificationCenter.d.ts.map