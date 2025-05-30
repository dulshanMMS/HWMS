import React from 'react';
import { Loader as MantineLoader } from '@mantine/core';
import { cx, css } from '@emotion/css';
import { useNovuTheme } from '../../../hooks';
import { useStyles } from '../../../store/styles';
export const Loader = ({ color }) => {
    const { theme } = useNovuTheme();
    const [loaderStyles] = useStyles(['loader.root']);
    const loaderColor = color || theme.loaderColor;
    return (React.createElement("div", { style: {
            textAlign: 'center',
            minHeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        } },
        React.createElement(MantineLoader, { className: cx('nc-loader', css(loaderStyles)), color: loaderColor })));
};
//# sourceMappingURL=Loader.js.map