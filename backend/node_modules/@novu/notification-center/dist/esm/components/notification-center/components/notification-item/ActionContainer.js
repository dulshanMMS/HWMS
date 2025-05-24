import React from 'react';
import { ButtonTypeEnum, MessageActionStatusEnum } from '@novu/shared';
import styled from '@emotion/styled';
import { cx, css } from '@emotion/css';
import { NotificationButton } from './NotificationItemButton';
import { useStyles } from '../../../../store/styles';
export function ActionContainer({ action, onActionClick }) {
    const status = action === null || action === void 0 ? void 0 : action.status;
    const buttons = action === null || action === void 0 ? void 0 : action.buttons;
    const [buttonsContainerStyles, primaryButtonStyles, secondaryButtonStyles] = useStyles([
        'notifications.listItem.buttons.root',
        'notifications.listItem.buttons.primary',
        'notifications.listItem.buttons.secondary',
    ]);
    function handleOnClick(buttonType) {
        onActionClick(buttonType);
    }
    return (React.createElement(TemplateContainerWrap, null,
        React.createElement(TemplateContainer, { className: cx('nc-notifications-list-item-buttons', css(buttonsContainerStyles)) }, status === MessageActionStatusEnum.DONE
            ? null
            : buttons === null || buttons === void 0 ? void 0 : buttons.map((button, buttonIndex) => (React.createElement(NotificationButton, { key: button.type, className: cx('nc-notifications-list-item-button', css(button.type === ButtonTypeEnum.PRIMARY ? primaryButtonStyles : secondaryButtonStyles)), onActionClick: (buttonType) => handleOnClick(buttonType), messageAction: action, buttonIndex: buttonIndex }))))));
}
const TemplateContainerWrap = styled.div `
  margin-left: 10px;
  margin-right: 10px;
`;
const TemplateContainer = styled.div `
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  max-height: 50px;
  margin-left: -15px;
  margin-right: -15px;
`;
//# sourceMappingURL=ActionContainer.js.map