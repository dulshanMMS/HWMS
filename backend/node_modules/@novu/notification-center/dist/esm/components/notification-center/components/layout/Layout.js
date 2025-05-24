import React, { useState } from 'react';
import styled from '@emotion/styled';
import { css, cx } from '@emotion/css';
import { Header } from './header/Header';
import { UserPreferenceHeader } from './header/UserPreferenceHeader';
import { FooterContainer as Footer } from './footer/FooterContainer';
import { Loader } from '../Loader';
import { useNotificationCenter, useNovuContext, useNovuTheme } from '../../../../hooks';
import { SubscriberPreference } from '../user-preference/SubscriberPreference';
import { FeedsTabs } from '../FeedsTabs';
import { useStyles } from '../../../../store/styles';
import { ScreensEnum } from '../../../../shared/interfaces';
export function Layout() {
    const { header } = useNotificationCenter();
    const { isSessionInitialized } = useNovuContext();
    const { theme } = useNovuTheme();
    const [layoutStyles] = useStyles(['layout.root']);
    const [screen, setScreen] = useState(ScreensEnum.NOTIFICATIONS);
    return (React.createElement("div", { className: cx('nc-layout-wrapper', layoutWrapperCss(theme), css(layoutStyles)), "data-test-id": "layout-wrapper" },
        screen === ScreensEnum.SETTINGS ? (React.createElement(React.Fragment, null,
            header ? (header({ setScreen, screen })) : (React.createElement(UserPreferenceHeader, { onBackClick: () => setScreen(ScreensEnum.NOTIFICATIONS) })),
            React.createElement(ContentWrapper, null,
                React.createElement(SubscriberPreference, null)))) : (React.createElement(React.Fragment, null,
            header ? header({ setScreen, screen }) : React.createElement(Header, { onCogClick: () => setScreen(ScreensEnum.SETTINGS) }),
            React.createElement(ContentWrapper, null, isSessionInitialized ? (React.createElement(MainWrapper, { "data-test-id": "main-wrapper" },
                React.createElement(FeedsTabs, null))) : (React.createElement(Loader, null))))),
        React.createElement(Footer, null)));
}
const ContentWrapper = styled.div `
  overflow: auto;
  min-height: 400px;
`;
const layoutWrapperCss = (novuTheme) => css `
  padding: 15px 0;
  height: auto;
  border-radius: 7px;
  box-shadow: ${novuTheme.layout.boxShadow};
  background: ${novuTheme.layout.background};
`;
const MainWrapper = styled.div ``;
//# sourceMappingURL=Layout.js.map