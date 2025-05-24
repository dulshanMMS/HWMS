import React from 'react';
import { IMessage, ButtonTypeEnum } from '@novu/shared';
export declare function NotificationsList({ notifications, onFetch, hasNextPage, onNotificationClicked, }: {
    notifications: IMessage[] | never;
    onFetch: () => void;
    hasNextPage: boolean;
    onNotificationClicked: (notification: IMessage, actionButtonType?: ButtonTypeEnum) => void;
}): React.JSX.Element;
//# sourceMappingURL=NotificationsList.d.ts.map