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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelPreference = void 0;
const react_1 = __importStar(require("react"));
const core_1 = require("@mantine/core");
const styled_1 = __importDefault(require("@emotion/styled"));
const css_1 = require("@emotion/css");
const hooks_1 = require("../../../../hooks");
const channels_1 = require("./channels");
const styles_1 = require("./styles");
const Check_1 = require("../../../../shared/icons/Check");
const colors_1 = require("../../../../shared/config/colors");
const styles_2 = require("../../../../store/styles");
const iconClassName = (active, iconColor) => (0, css_1.css) `
  color: ${active ? iconColor.active : iconColor.inactive};
  width: 30px;
`;
const channelLabelClassName = (active, fontColor) => (0, css_1.css) `
  color: ${active ? fontColor.active : fontColor.inactive};
`;
const successClassName = (0, css_1.css) `
  color: ${colors_1.colors.success};
`;
function ChannelPreference({ type, active, disabled, handleUpdateChannelPreference }) {
    var _a, _b;
    const { label, Icon } = (0, channels_1.getChannel)(type);
    const { theme } = (0, hooks_1.useNovuTheme)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [showSaved, setShowSaved] = (0, react_1.useState)(false);
    const baseTheme = theme === null || theme === void 0 ? void 0 : theme.userPreferences;
    const iconColor = (_a = baseTheme === null || baseTheme === void 0 ? void 0 : baseTheme.accordionItem) === null || _a === void 0 ? void 0 : _a.icon;
    const fontColor = (_b = baseTheme === null || baseTheme === void 0 ? void 0 : baseTheme.accordionItem) === null || _b === void 0 ? void 0 : _b.fontColor;
    const [switchRootStyles, switchInputStyles, switchTrackStyles, switchThumbStyles, itemContentIconStyles, itemContentChannelLabelStyles, itemContentSuccessStyles,] = (0, styles_2.useStyles)([
        'switch.root',
        'switch.input',
        'switch.track',
        'switch.thumb',
        'preferences.item.content.icon',
        'preferences.item.content.channelLabel',
        'preferences.item.content.success',
    ]);
    const channelSwitchStyles = (0, styles_1.switchStyles)(baseTheme);
    const channelSwitchClassNames = {
        root: (0, css_1.css)(switchRootStyles),
        input: (0, css_1.css)(switchInputStyles),
        track: (0, css_1.css)(switchTrackStyles),
        thumb: (0, css_1.css)(switchThumbStyles),
    };
    const updateChannel = (checked) => __awaiter(this, void 0, void 0, function* () {
        setIsLoading(true);
        yield handleUpdateChannelPreference(type, checked);
        setIsLoading(false);
        setShowSaved(true);
        setTimeout(() => {
            setShowSaved(false);
        }, 1500);
    });
    return (react_1.default.createElement(ChannelItemWrapper, { "data-test-id": "channel-preference-item" },
        react_1.default.createElement(LeftContentWrapper, null,
            react_1.default.createElement(Icon, { className: (0, css_1.cx)('nc-preferences-item-icon', iconClassName(active, iconColor), (0, css_1.css)(itemContentIconStyles)) }),
            react_1.default.createElement(styles_1.Text, { size: 'md', className: (0, css_1.cx)('nc-preferences-channel-label', channelLabelClassName(active, fontColor), (0, css_1.css)(itemContentChannelLabelStyles)) }, label)),
        react_1.default.createElement(RightContentWrapper, null,
            showSaved && (react_1.default.createElement("div", { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' } },
                react_1.default.createElement(Check_1.Check, { color: colors_1.colors.success }),
                react_1.default.createElement(styles_1.Text, { size: "sm", className: (0, css_1.cx)('nc-preferences-item-success', successClassName, (0, css_1.css)(itemContentSuccessStyles)) }, "Saved"))),
            react_1.default.createElement(SwitchWrapper, null,
                react_1.default.createElement(core_1.LoadingOverlay, { visible: isLoading, "data-test-id": "channel-preference-item-loader", loaderProps: {
                        size: 15,
                        color: theme.loaderColor,
                    }, overlayOpacity: 0.3, overlayColor: "transparent", sx: {
                        justifyContent: active ? 'right' : 'left',
                        marginLeft: '3px',
                        marginRight: '1.5px',
                        marginTop: '1px',
                    } }),
                react_1.default.createElement(core_1.Switch, { "data-test-id": "channel-preference-item-toggle", styles: channelSwitchStyles, classNames: channelSwitchClassNames, disabled: disabled && !isLoading, checked: active, onChange: (e) => updateChannel(e.target.checked) })))));
}
exports.ChannelPreference = ChannelPreference;
const ChannelItemWrapper = styled_1.default.div `
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const LeftContentWrapper = styled_1.default.div `
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;
`;
const RightContentWrapper = styled_1.default.div `
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 13px;
`;
const SwitchWrapper = styled_1.default.div `
  width: inherit;
  height: inherit;
  position: relative;

  svg circle {
    stroke-opacity: 0;
  }
`;
//# sourceMappingURL=ChannelPreference.js.map