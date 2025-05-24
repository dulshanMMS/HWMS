import { createStyles } from '@mantine/core';
import { colors } from '../../../../../shared/config/colors';
export default createStyles((theme, { novuTheme, common, colorScheme }, getRef) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const tabLabel = getRef('tabLabel');
    const tabIcon = getRef('tabIcon');
    return {
        tabsList: {
            gap: '30px',
            padding: '15px',
            paddingBottom: 0,
            borderBottom: `1px solid ${colorScheme === 'dark' ? colors.B20 : colors.B98}`,
        },
        tab: {
            display: 'block',
            cursor: 'pointer',
            borderBottom: 'none',
            marginBottom: '0',
            padding: '0px',
            height: '36px',
            [`.mantine-Badge-root`]: {
                background: 'transparent',
                border: `1px solid ${colors.B60}`,
                color: colors.B60,
            },
            '&:hover': {
                background: 'none',
                [`& .${tabIcon}`]: {
                    color: (_a = novuTheme.header) === null || _a === void 0 ? void 0 : _a.fontColor,
                },
                [`& .${tabLabel}`]: {
                    color: (_b = novuTheme.header) === null || _b === void 0 ? void 0 : _b.fontColor,
                },
            },
            ['&[data-active]']: {
                width: 'auto',
                [`.mantine-Badge-root`]: {
                    background: (_c = novuTheme.header) === null || _c === void 0 ? void 0 : _c.badgeColor,
                    border: 'none',
                    color: (_d = novuTheme.header) === null || _d === void 0 ? void 0 : _d.badgeTextColor,
                },
                [`& .${tabLabel}`]: {
                    color: (_e = novuTheme.header) === null || _e === void 0 ? void 0 : _e.fontColor,
                    '&::after': {
                        content: '""',
                        display: 'block',
                        height: '2px',
                        background: ((_f = novuTheme === null || novuTheme === void 0 ? void 0 : novuTheme.header) === null || _f === void 0 ? void 0 : _f.tabBorderColor) || ((_g = novuTheme.header) === null || _g === void 0 ? void 0 : _g.badgeColor),
                        borderRadius: '10px',
                    },
                },
                [`& .${tabIcon}`]: {
                    color: 'red',
                    background: (_h = novuTheme.header) === null || _h === void 0 ? void 0 : _h.badgeColor,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                },
            },
        },
        tabLabel: {
            ref: tabLabel,
            fontFamily: common.fontFamily,
            fontSize: '14px',
            fontWeight: 700,
            color: colors.B60,
            textAlign: 'left',
        },
        tabIcon: {
            ref: tabIcon,
            display: 'block',
            fontSize: '26px',
            fontWeight: 700,
            marginBottom: '5px',
            color: colors.B60,
            textAlign: 'left',
        },
    };
});
//# sourceMappingURL=Tabs.styles.js.map