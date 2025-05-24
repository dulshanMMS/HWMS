"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferenceItem = void 0;
const react_1 = __importDefault(require("react"));
const styled_1 = __importDefault(require("@emotion/styled"));
const css_1 = require("@emotion/css");
const core_1 = require("@mantine/core");
const styles_1 = require("../../../../store/styles");
const hooks_1 = require("../../../../hooks");
const WorkflowHeader_1 = require("./WorkflowHeader");
const channels_1 = require("./channels");
const ChannelPreference_1 = require("./ChannelPreference");
const dividerClassName = (baseTheme) => {
    var _a;
    return (0, css_1.css) `
  border-top-color: ${(_a = baseTheme === null || baseTheme === void 0 ? void 0 : baseTheme.accordion) === null || _a === void 0 ? void 0 : _a.dividerColor};
`;
};
const ChannelsWrapper = styled_1.default.div `
  display: flex;
  flex-direction: column;
  padding: 0;
  gap: 20px;
`;
function getEnabledChannels(channels) {
    const keys = Object.keys(channels);
    const list = keys.filter((key) => channels[key]).map((channel) => (0, channels_1.getChannel)(channel).label);
    return list.join(', ');
}
const UserPreferenceItem = ({ preferenceSettings }) => {
    var _a, _b, _c;
    const { theme } = (0, hooks_1.useNovuTheme)();
    const { isLoading: isPreferenceUpdating, updateUserPreferences } = (0, hooks_1.useUpdateUserPreferences)();
    const [itemDividerStyles] = (0, styles_1.useStyles)(['preferences.item.divider']);
    const baseTheme = theme === null || theme === void 0 ? void 0 : theme.userPreferences;
    const channelsKeys = Object.keys((_a = preferenceSettings === null || preferenceSettings === void 0 ? void 0 : preferenceSettings.preference) === null || _a === void 0 ? void 0 : _a.channels);
    const channelsPreference = (_b = preferenceSettings === null || preferenceSettings === void 0 ? void 0 : preferenceSettings.preference) === null || _b === void 0 ? void 0 : _b.channels;
    const handleUpdateChannelPreference = (type, checked) => {
        updateUserPreferences({ templateId: preferenceSettings.template._id, channelType: type, checked });
    };
    return (react_1.default.createElement(core_1.Accordion.Item, { value: preferenceSettings.template._id, "data-test-id": "workflow-list-item" },
        react_1.default.createElement(core_1.Accordion.Control, null,
            react_1.default.createElement(WorkflowHeader_1.WorkflowHeader, { theme: baseTheme, label: (_c = preferenceSettings.template) === null || _c === void 0 ? void 0 : _c.name, channels: getEnabledChannels(channelsPreference) })),
        react_1.default.createElement(core_1.Accordion.Panel, null,
            react_1.default.createElement(ChannelsWrapper, null,
                react_1.default.createElement(core_1.Divider, { className: (0, css_1.cx)('nc-preferences-item-divider', dividerClassName(baseTheme), (0, css_1.css)(itemDividerStyles)) }),
                channelsKeys.map((key) => (react_1.default.createElement(ChannelPreference_1.ChannelPreference, { key: key, type: key, active: channelsPreference[key], disabled: isPreferenceUpdating, handleUpdateChannelPreference: handleUpdateChannelPreference })))))));
};
exports.UserPreferenceItem = UserPreferenceItem;
//# sourceMappingURL=UserPreferenceItem.js.map