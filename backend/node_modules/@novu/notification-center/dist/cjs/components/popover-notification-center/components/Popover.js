"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Popover = void 0;
const react_1 = __importStar(require("react"));
const core_1 = require("@mantine/core");
const styled_1 = __importDefault(require("@emotion/styled"));
const css_1 = require("@emotion/css");
const styles_1 = require("../../../store/styles");
const hooks_1 = require("../../../hooks");
function Popover({ children, bell, theme, offset = 0, position = 'bottom-end' }) {
    var _a;
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    const { cx, classes } = usePopoverStyles((_a = theme.popover) === null || _a === void 0 ? void 0 : _a.arrowColor);
    const [popoverArrowStyles, popoverDropdownStyles] = (0, styles_1.useStyles)(['popover.arrow', 'popover.dropdown']);
    const overrideClasses = {
        arrow: cx(classes.arrow, (0, css_1.css)(popoverArrowStyles)),
        dropdown: cx(classes.dropdown, (0, css_1.css)(popoverDropdownStyles)),
    };
    const { markFetchedNotificationsAsSeen } = (0, hooks_1.useNotifications)();
    function handlerBellClick() {
        if (isVisible) {
            markFetchedNotificationsAsSeen();
        }
        setIsVisible(!isVisible);
    }
    function handlerOnClose() {
        setIsVisible(false);
        markFetchedNotificationsAsSeen();
    }
    return (react_1.default.createElement(core_1.Popover, { opened: isVisible, onClose: handlerOnClose, position: position, withArrow: true, classNames: overrideClasses, offset: offset, withinPortal: true },
        react_1.default.createElement(core_1.Popover.Target, null,
            react_1.default.createElement(BellContainer, { onClick: handlerBellClick },
                " ",
                bell({}))),
        react_1.default.createElement(core_1.Popover.Dropdown, null,
            " ",
            children)));
}
exports.Popover = Popover;
const BellContainer = styled_1.default.span ``;
const usePopoverStyles = (0, core_1.createStyles)((theme, arrowColor) => ({
    dropdown: {
        padding: '0px',
        backgroundColor: 'transparent',
        border: 'none',
    },
    arrow: {
        background: arrowColor,
        backgroundColor: arrowColor,
        borderColor: arrowColor,
    },
}));
//# sourceMappingURL=Popover.js.map