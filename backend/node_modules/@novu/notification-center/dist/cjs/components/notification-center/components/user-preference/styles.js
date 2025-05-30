"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextBlock = exports.Text = exports.switchStyles = exports.accordionStyles = void 0;
const styled_1 = __importDefault(require("@emotion/styled"));
const accordionStyles = (baseTheme, font) => {
    var _a;
    return {
        item: {
            borderBottom: 'none',
            boxShadow: baseTheme.accordion.boxShadow,
            backgroundColor: baseTheme.accordion.background,
            marginBottom: '15px',
            borderRadius: '7px',
        },
        content: {
            color: baseTheme.accordion.fontColor,
            fontFamily: font,
        },
        control: {
            fontFamily: font,
            height: '65px',
            '&:hover': {
                backgroundColor: baseTheme.accordion.background,
                borderRadius: '7px',
            },
        },
        chevron: {
            color: (_a = baseTheme.accordion) === null || _a === void 0 ? void 0 : _a.arrowColor,
        },
    };
};
exports.accordionStyles = accordionStyles;
const switchStyles = (baseTheme) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return {
        root: {
            width: '100%',
            maxWidth: '70px',
            display: 'flex',
            alignItems: 'center',
        },
        input: {
            background: (_b = (_a = baseTheme.accordionItem) === null || _a === void 0 ? void 0 : _a.switch) === null || _b === void 0 ? void 0 : _b.backgroundUnchecked,
            width: '1px',
            height: '1px',
            border: 'transparent',
            cursor: 'pointer',
            '&::before': {
                border: 'transparent',
                width: '20px',
                height: '20px',
            },
            '&:checked ~ label': {
                background: (_d = (_c = baseTheme.accordionItem) === null || _c === void 0 ? void 0 : _c.switch) === null || _d === void 0 ? void 0 : _d.backgroundChecked,
            },
            '&:not(checked) ~ label': {
                background: (_f = (_e = baseTheme.accordionItem) === null || _e === void 0 ? void 0 : _e.switch) === null || _f === void 0 ? void 0 : _f.backgroundUnchecked,
            },
            '&:disabled:not(:checked) ~ label': {
                background: (_h = (_g = baseTheme.accordionItem) === null || _g === void 0 ? void 0 : _g.switch) === null || _h === void 0 ? void 0 : _h.backgroundUnchecked,
            },
            '&:disabled': {
                opacity: 0.3,
            },
        },
        track: {
            width: '46px',
            height: '24px',
            border: 'none',
        },
        thumb: {
            border: 'none',
        },
    };
};
exports.switchStyles = switchStyles;
exports.Text = styled_1.default.div `
  font-size: ${({ size }) => (size === 'sm' ? '12px' : '14px')};
  font-style: normal;
  align-items: center;
  font-weight: ${({ size }) => (size === 'lg' ? '700' : '400')};
  line-height: ${({ size }) => (size === 'sm' ? '14.4px' : '16.8px')};
  text-align: left;
`;
exports.TextBlock = styled_1.default.div `
  display: flex;
  flex-direction: column;
  padding: 0;
  gap: 5px;
  align-items: flex-start;
`;
//# sourceMappingURL=styles.js.map