import React from 'react';
import { MantineProvider } from '@mantine/core';
import { css } from '@emotion/css';
import { Layout } from './layout/Layout';
import { useNovuTheme } from '../../../hooks';
import { useFetchOrganization } from '../../../hooks';
export function AppContent() {
    var _a, _b, _c, _d;
    const { theme, common } = useNovuTheme();
    const { data: organization } = useFetchOrganization();
    const primaryColor = (_b = (_a = organization === null || organization === void 0 ? void 0 : organization.branding) === null || _a === void 0 ? void 0 : _a.color) !== null && _b !== void 0 ? _b : theme.loaderColor;
    const fontFamily = common.fontFamily || ((_c = organization === null || organization === void 0 ? void 0 : organization.branding) === null || _c === void 0 ? void 0 : _c.fontFamily);
    const dir = (((_d = organization === null || organization === void 0 ? void 0 : organization.branding) === null || _d === void 0 ? void 0 : _d.direction) === 'rtl' ? 'rtl' : 'ltr');
    const themeConfig = {
        fontFamily,
        dir,
    };
    return (React.createElement(MantineProvider, { theme: themeConfig },
        React.createElement("div", { className: wrapperClassName(primaryColor, fontFamily, dir) },
            React.createElement(Layout, null))));
}
const wrapperClassName = (primaryColor, fontFamily, dir) => css `
  margin: 0;
  font-family: ${fontFamily === 'inherit' ? fontFamily : `${fontFamily}, Helvetica, sans-serif`};
  color: #333737;
  direction: ${dir};
  width: 420px;
  z-index: 999;

  ::-moz-selection {
    background: ${primaryColor};
  }

  *::selection {
    background: ${primaryColor};
  }
`;
//# sourceMappingURL=AppContent.js.map