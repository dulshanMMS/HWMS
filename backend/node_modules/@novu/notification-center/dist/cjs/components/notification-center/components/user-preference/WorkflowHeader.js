"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowHeader = void 0;
const react_1 = __importDefault(require("react"));
const css_1 = require("@emotion/css");
const styles_1 = require("./styles");
const styles_2 = require("../../../../store/styles");
const preferencesTitleClassName = (theme) => {
    var _a;
    return (0, css_1.css) `
  color: ${(_a = theme === null || theme === void 0 ? void 0 : theme.accordion) === null || _a === void 0 ? void 0 : _a.fontColor};
`;
};
const preferencesChannelsClassName = (theme) => {
    var _a;
    return (0, css_1.css) `
  color: ${(_a = theme === null || theme === void 0 ? void 0 : theme.accordion) === null || _a === void 0 ? void 0 : _a.secondaryFontColor};
`;
};
const WorkflowHeader = ({ theme, label, channels, }) => {
    const [itemTitleStyles, itemChannelsStyles] = (0, styles_2.useStyles)(['preferences.item.title', 'preferences.item.channels']);
    return (react_1.default.createElement(styles_1.TextBlock, null,
        react_1.default.createElement(styles_1.Text, { size: 'lg', className: (0, css_1.cx)('nc-preferences-item-title', preferencesTitleClassName(theme), (0, css_1.css)(itemTitleStyles)) }, label),
        react_1.default.createElement(styles_1.Text, { "data-test-id": "workflow-active-channels", size: 'sm', className: (0, css_1.cx)('nc-preferences-item-channels', preferencesChannelsClassName(theme), (0, css_1.css)(itemChannelsStyles)) }, channels)));
};
exports.WorkflowHeader = WorkflowHeader;
//# sourceMappingURL=WorkflowHeader.js.map