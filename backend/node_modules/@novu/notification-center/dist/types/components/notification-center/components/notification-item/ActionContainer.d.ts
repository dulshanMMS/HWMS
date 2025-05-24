import React from 'react';
import { IMessageAction, ButtonTypeEnum } from '@novu/shared';
export interface IActionContainerProps {
    action?: IMessageAction;
    onActionClick: (actionButtonType: ButtonTypeEnum) => void;
}
export declare function ActionContainer({ action, onActionClick }: IActionContainerProps): React.JSX.Element;
//# sourceMappingURL=ActionContainer.d.ts.map