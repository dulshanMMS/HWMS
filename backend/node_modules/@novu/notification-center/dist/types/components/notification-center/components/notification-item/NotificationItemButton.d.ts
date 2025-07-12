import React from 'react';
import { IButtonStyles, ButtonTypeEnum, IMessageAction } from '@novu/shared';
interface NotificationButtonProps {
    messageAction: IMessageAction;
    onActionClick: (actionButtonType: ButtonTypeEnum) => void;
    buttonIndex: number;
    className?: string;
}
export declare function NotificationButton({ className, messageAction, buttonIndex, onActionClick }: NotificationButtonProps): React.JSX.Element;
export declare const actionButtonStyles: (buttonStyle: IButtonStyles) => string;
export {};
//# sourceMappingURL=NotificationItemButton.d.ts.map