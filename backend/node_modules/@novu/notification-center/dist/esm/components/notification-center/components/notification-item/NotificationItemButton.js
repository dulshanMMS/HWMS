import React from 'react';
import { Button } from '@mantine/core';
import { css, cx } from '@emotion/css';
import { useNovuTheme } from '../../../../hooks';
export function NotificationButton({ className, messageAction, buttonIndex, onActionClick }) {
    const { theme } = useNovuTheme();
    const button = messageAction.buttons[buttonIndex];
    const buttonStyle = theme.notificationItem.buttons[button.type];
    const buttonText = (button === null || button === void 0 ? void 0 : button.content) ? button.content : '';
    function handleOnclick(e) {
        e.stopPropagation();
        onActionClick(button.type);
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, { onClick: (e) => handleOnclick(e), className: cx(actionButtonStyles(buttonStyle), className), fullWidth: true }, buttonText)));
}
export const actionButtonStyles = (buttonStyle) => css `
  background: ${buttonStyle.backGroundColor};
  color: ${buttonStyle.fontColor};
  box-shadow: none;
  display: flex;
  justify-content: center;
  margin-left: 5px;
  margin-right: 5px;
  height: 30px;
  font-weight: 700;
  font-size: 12px;
  border-radius: 7px;
  border: 0;

  &:hover {
    background: ${buttonStyle.backGroundColor};
  }
`;
//# sourceMappingURL=NotificationItemButton.js.map