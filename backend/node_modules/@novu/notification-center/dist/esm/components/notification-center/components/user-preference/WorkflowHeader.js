import React from 'react';
import { css, cx } from '@emotion/css';
import { Text, TextBlock } from './styles';
import { useStyles } from '../../../../store/styles';
const preferencesTitleClassName = (theme) => {
    var _a;
    return css `
  color: ${(_a = theme === null || theme === void 0 ? void 0 : theme.accordion) === null || _a === void 0 ? void 0 : _a.fontColor};
`;
};
const preferencesChannelsClassName = (theme) => {
    var _a;
    return css `
  color: ${(_a = theme === null || theme === void 0 ? void 0 : theme.accordion) === null || _a === void 0 ? void 0 : _a.secondaryFontColor};
`;
};
export const WorkflowHeader = ({ theme, label, channels, }) => {
    const [itemTitleStyles, itemChannelsStyles] = useStyles(['preferences.item.title', 'preferences.item.channels']);
    return (React.createElement(TextBlock, null,
        React.createElement(Text, { size: 'lg', className: cx('nc-preferences-item-title', preferencesTitleClassName(theme), css(itemTitleStyles)) }, label),
        React.createElement(Text, { "data-test-id": "workflow-active-channels", size: 'sm', className: cx('nc-preferences-item-channels', preferencesChannelsClassName(theme), css(itemChannelsStyles)) }, channels)));
};
//# sourceMappingURL=WorkflowHeader.js.map