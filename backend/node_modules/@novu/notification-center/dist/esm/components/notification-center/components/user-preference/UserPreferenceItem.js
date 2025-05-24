import React from 'react';
import styled from '@emotion/styled';
import { css, cx } from '@emotion/css';
import { Accordion, Divider } from '@mantine/core';
import { useStyles } from '../../../../store/styles';
import { useNovuTheme, useUpdateUserPreferences } from '../../../../hooks';
import { WorkflowHeader } from './WorkflowHeader';
import { getChannel } from './channels';
import { ChannelPreference } from './ChannelPreference';
const dividerClassName = (baseTheme) => {
    var _a;
    return css `
  border-top-color: ${(_a = baseTheme === null || baseTheme === void 0 ? void 0 : baseTheme.accordion) === null || _a === void 0 ? void 0 : _a.dividerColor};
`;
};
const ChannelsWrapper = styled.div `
  display: flex;
  flex-direction: column;
  padding: 0;
  gap: 20px;
`;
function getEnabledChannels(channels) {
    const keys = Object.keys(channels);
    const list = keys.filter((key) => channels[key]).map((channel) => getChannel(channel).label);
    return list.join(', ');
}
export const UserPreferenceItem = ({ preferenceSettings }) => {
    var _a, _b, _c;
    const { theme } = useNovuTheme();
    const { isLoading: isPreferenceUpdating, updateUserPreferences } = useUpdateUserPreferences();
    const [itemDividerStyles] = useStyles(['preferences.item.divider']);
    const baseTheme = theme === null || theme === void 0 ? void 0 : theme.userPreferences;
    const channelsKeys = Object.keys((_a = preferenceSettings === null || preferenceSettings === void 0 ? void 0 : preferenceSettings.preference) === null || _a === void 0 ? void 0 : _a.channels);
    const channelsPreference = (_b = preferenceSettings === null || preferenceSettings === void 0 ? void 0 : preferenceSettings.preference) === null || _b === void 0 ? void 0 : _b.channels;
    const handleUpdateChannelPreference = (type, checked) => {
        updateUserPreferences({ templateId: preferenceSettings.template._id, channelType: type, checked });
    };
    return (React.createElement(Accordion.Item, { value: preferenceSettings.template._id, "data-test-id": "workflow-list-item" },
        React.createElement(Accordion.Control, null,
            React.createElement(WorkflowHeader, { theme: baseTheme, label: (_c = preferenceSettings.template) === null || _c === void 0 ? void 0 : _c.name, channels: getEnabledChannels(channelsPreference) })),
        React.createElement(Accordion.Panel, null,
            React.createElement(ChannelsWrapper, null,
                React.createElement(Divider, { className: cx('nc-preferences-item-divider', dividerClassName(baseTheme), css(itemDividerStyles)) }),
                channelsKeys.map((key) => (React.createElement(ChannelPreference, { key: key, type: key, active: channelsPreference[key], disabled: isPreferenceUpdating, handleUpdateChannelPreference: handleUpdateChannelPreference })))))));
};
//# sourceMappingURL=UserPreferenceItem.js.map