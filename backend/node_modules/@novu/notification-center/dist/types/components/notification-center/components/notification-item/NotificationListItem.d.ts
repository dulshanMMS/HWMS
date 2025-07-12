/// <reference types="react" />
import { IMessage, ButtonTypeEnum } from '@novu/shared';
export declare function NotificationListItem({ notification, onClick, }: {
    notification: IMessage;
    onClick: (notification: IMessage, actionButtonType?: ButtonTypeEnum) => void;
}): JSX.Element;
export declare const readSupportAdded: (notification: IMessage) => boolean;
//# sourceMappingURL=NotificationListItem.d.ts.map