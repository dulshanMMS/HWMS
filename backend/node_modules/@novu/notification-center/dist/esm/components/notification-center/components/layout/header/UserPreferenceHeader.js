import React from 'react';
import { ActionIcon } from '@mantine/core';
import { css, cx } from '@emotion/css';
import { ArrowLeft } from '../../../../../shared/icons';
import { useNovuTheme, useTranslations } from '../../../../../hooks';
import { useStyles } from '../../../../../store/styles';
export function UserPreferenceHeader({ onBackClick }) {
    const { theme } = useNovuTheme();
    const { t } = useTranslations();
    const [headerStyles, headerTitleStyles, backButtonStyles] = useStyles([
        'header.root',
        'header.title',
        'header.backButton',
    ]);
    return (React.createElement("div", { className: cx('nc-header', headerClassName, css(headerStyles)) },
        React.createElement(ActionIcon, { className: cx('nc-header-back-button', css `
            color: ${theme.header.fontColor};
          `, css(backButtonStyles)), "data-test-id": "go-back-btn", variant: "transparent", onClick: onBackClick },
            React.createElement(ArrowLeft, { style: { marginLeft: '15px' } })),
        React.createElement("div", { className: cx('nc-header-title', titleClassName(theme.header.fontColor), css(headerTitleStyles)) }, t('settings'))));
}
const titleClassName = (fontColor) => css `
  color: ${fontColor};
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  text-align: left;
`;
const headerClassName = css `
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 55px;
  gap: 10px;
`;
//# sourceMappingURL=UserPreferenceHeader.js.map