"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionContainer = void 0;
const react_1 = __importDefault(require("react"));
const shared_1 = require("@novu/shared");
const styled_1 = __importDefault(require("@emotion/styled"));
const css_1 = require("@emotion/css");
const NotificationItemButton_1 = require("./NotificationItemButton");
const styles_1 = require("../../../../store/styles");
function ActionContainer({ action, onActionClick }) {
    const status = action === null || action === void 0 ? void 0 : action.status;
    const buttons = action === null || action === void 0 ? void 0 : action.buttons;
    const [buttonsContainerStyles, primaryButtonStyles, secondaryButtonStyles] = (0, styles_1.useStyles)([
        'notifications.listItem.buttons.root',
        'notifications.listItem.buttons.primary',
        'notifications.listItem.buttons.secondary',
    ]);
    function handleOnClick(buttonType) {
        onActionClick(buttonType);
    }
    return (react_1.default.createElement(TemplateContainerWrap, null,
        react_1.default.createElement(TemplateContainer, { className: (0, css_1.cx)('nc-notifications-list-item-buttons', (0, css_1.css)(buttonsContainerStyles)) }, status === shared_1.MessageActionStatusEnum.DONE
            ? null
            : buttons === null || buttons === void 0 ? void 0 : buttons.map((button, buttonIndex) => (react_1.default.createElement(NotificationItemButton_1.NotificationButton, { key: button.type, className: (0, css_1.cx)('nc-notifications-list-item-button', (0, css_1.css)(button.type === shared_1.ButtonTypeEnum.PRIMARY ? primaryButtonStyles : secondaryButtonStyles)), onActionClick: (buttonType) => handleOnClick(buttonType), messageAction: action, buttonIndex: buttonIndex }))))));
}
exports.ActionContainer = ActionContainer;
const TemplateContainerWrap = styled_1.default.div `
  margin-left: 10px;
  margin-right: 10px;
`;
const TemplateContainer = styled_1.default.div `
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  max-height: 50px;
  margin-left: -15px;
  margin-right: -15px;
`;
//# sourceMappingURL=ActionContainer.js.map