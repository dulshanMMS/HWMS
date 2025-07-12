"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionButtonStyles = exports.NotificationButton = void 0;
const react_1 = __importDefault(require("react"));
const core_1 = require("@mantine/core");
const css_1 = require("@emotion/css");
const hooks_1 = require("../../../../hooks");
function NotificationButton({ className, messageAction, buttonIndex, onActionClick }) {
    const { theme } = (0, hooks_1.useNovuTheme)();
    const button = messageAction.buttons[buttonIndex];
    const buttonStyle = theme.notificationItem.buttons[button.type];
    const buttonText = (button === null || button === void 0 ? void 0 : button.content) ? button.content : '';
    function handleOnclick(e) {
        e.stopPropagation();
        onActionClick(button.type);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(core_1.Button, { onClick: (e) => handleOnclick(e), className: (0, css_1.cx)((0, exports.actionButtonStyles)(buttonStyle), className), fullWidth: true }, buttonText)));
}
exports.NotificationButton = NotificationButton;
const actionButtonStyles = (buttonStyle) => (0, css_1.css) `
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
exports.actionButtonStyles = actionButtonStyles;
//# sourceMappingURL=NotificationItemButton.js.map