import React from 'react';
import { Tabs as MantineTabs } from '@mantine/core';
import { css, cx } from '@emotion/css';
import useTabStyles from './Tabs.styles';
import { useNovuTheme } from '../../../../../hooks';
import { useStyles } from '../../../../../store/styles';
export function Tabs({ children, onTabChange, value }) {
    const { theme: novuTheme, common, colorScheme } = useNovuTheme();
    const { classes } = useTabStyles({ novuTheme, common, colorScheme });
    const [tabsListStyles, tabStyles, tabLabelStyles, tabIconStyles] = useStyles([
        'tabs.tabsList',
        'tabs.tab',
        'tabs.tabLabel',
        'tabs.tabIcon',
    ]);
    const overrideClasses = {
        tabsList: cx(classes.tabsList, css(tabsListStyles)),
        tab: cx(classes.tab, css(tabStyles)),
        tabLabel: cx(classes.tabLabel, css(tabLabelStyles)),
        tabIcon: cx(classes.tabIcon, css(tabIconStyles)),
    };
    return (React.createElement(MantineTabs, { onTabChange: onTabChange, defaultValue: value, keepMounted: false, variant: "default", classNames: overrideClasses }, children));
}
//# sourceMappingURL=Tabs.js.map