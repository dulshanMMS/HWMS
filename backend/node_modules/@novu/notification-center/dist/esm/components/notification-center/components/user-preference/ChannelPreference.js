var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useState } from 'react';
import { LoadingOverlay, Switch } from '@mantine/core';
import styled from '@emotion/styled';
import { css, cx } from '@emotion/css';
import { useNovuTheme } from '../../../../hooks';
import { getChannel } from './channels';
import { switchStyles, Text } from './styles';
import { Check } from '../../../../shared/icons/Check';
import { colors } from '../../../../shared/config/colors';
import { useStyles } from '../../../../store/styles';
const iconClassName = (active, iconColor) => css `
  color: ${active ? iconColor.active : iconColor.inactive};
  width: 30px;
`;
const channelLabelClassName = (active, fontColor) => css `
  color: ${active ? fontColor.active : fontColor.inactive};
`;
const successClassName = css `
  color: ${colors.success};
`;
export function ChannelPreference({ type, active, disabled, handleUpdateChannelPreference }) {
    var _a, _b;
    const { label, Icon } = getChannel(type);
    const { theme } = useNovuTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const baseTheme = theme === null || theme === void 0 ? void 0 : theme.userPreferences;
    const iconColor = (_a = baseTheme === null || baseTheme === void 0 ? void 0 : baseTheme.accordionItem) === null || _a === void 0 ? void 0 : _a.icon;
    const fontColor = (_b = baseTheme === null || baseTheme === void 0 ? void 0 : baseTheme.accordionItem) === null || _b === void 0 ? void 0 : _b.fontColor;
    const [switchRootStyles, switchInputStyles, switchTrackStyles, switchThumbStyles, itemContentIconStyles, itemContentChannelLabelStyles, itemContentSuccessStyles,] = useStyles([
        'switch.root',
        'switch.input',
        'switch.track',
        'switch.thumb',
        'preferences.item.content.icon',
        'preferences.item.content.channelLabel',
        'preferences.item.content.success',
    ]);
    const channelSwitchStyles = switchStyles(baseTheme);
    const channelSwitchClassNames = {
        root: css(switchRootStyles),
        input: css(switchInputStyles),
        track: css(switchTrackStyles),
        thumb: css(switchThumbStyles),
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
    return (React.createElement(ChannelItemWrapper, { "data-test-id": "channel-preference-item" },
        React.createElement(LeftContentWrapper, null,
            React.createElement(Icon, { className: cx('nc-preferences-item-icon', iconClassName(active, iconColor), css(itemContentIconStyles)) }),
            React.createElement(Text, { size: 'md', className: cx('nc-preferences-channel-label', channelLabelClassName(active, fontColor), css(itemContentChannelLabelStyles)) }, label)),
        React.createElement(RightContentWrapper, null,
            showSaved && (React.createElement("div", { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' } },
                React.createElement(Check, { color: colors.success }),
                React.createElement(Text, { size: "sm", className: cx('nc-preferences-item-success', successClassName, css(itemContentSuccessStyles)) }, "Saved"))),
            React.createElement(SwitchWrapper, null,
                React.createElement(LoadingOverlay, { visible: isLoading, "data-test-id": "channel-preference-item-loader", loaderProps: {
                        size: 15,
                        color: theme.loaderColor,
                    }, overlayOpacity: 0.3, overlayColor: "transparent", sx: {
                        justifyContent: active ? 'right' : 'left',
                        marginLeft: '3px',
                        marginRight: '1.5px',
                        marginTop: '1px',
                    } }),
                React.createElement(Switch, { "data-test-id": "channel-preference-item-toggle", styles: channelSwitchStyles, classNames: channelSwitchClassNames, disabled: disabled && !isLoading, checked: active, onChange: (e) => updateChannel(e.target.checked) })))));
}
const ChannelItemWrapper = styled.div `
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const LeftContentWrapper = styled.div `
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;
`;
const RightContentWrapper = styled.div `
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 13px;
`;
const SwitchWrapper = styled.div `
  width: inherit;
  height: inherit;
  position: relative;

  svg circle {
    stroke-opacity: 0;
  }
`;
//# sourceMappingURL=ChannelPreference.js.map