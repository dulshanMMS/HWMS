import React, { useLayoutEffect } from 'react';
import { Accordion, ScrollArea } from '@mantine/core';
import { css, cx } from '@emotion/css';
import { useNovuTheme, useFetchUserPreferences, useNovuContext, useNotificationCenter } from '../../../../hooks';
import { accordionStyles } from './styles';
import { useStyles } from '../../../../store/styles';
import { UserPreferenceItem } from './UserPreferenceItem';
import { Loader } from '../Loader';
import { NoSettings } from '../../../../images/NoSettings';
const rootClassName = css `
  padding: 15px;
`;
export function SubscriberPreference() {
    var _a;
    const { setFetchingStrategy } = useNovuContext();
    const { theme, common } = useNovuTheme();
    const { data, isLoading: arePreferencesLoading } = useFetchUserPreferences();
    const { preferenceFilter } = useNotificationCenter();
    const [rootStyles, accordionItemStyles, accordionContentStyles, accordionControlStyles, accordionChevronStyles] = useStyles(['preferences.root', 'accordion.item', 'accordion.content', 'accordion.control', 'accordion.chevron']);
    const baseTheme = theme === null || theme === void 0 ? void 0 : theme.userPreferences;
    let preferences = (_a = data === null || data === void 0 ? void 0 : data.filter((item) => !item.template.critical)) === null || _a === void 0 ? void 0 : _a.filter((pref) => Object.keys(pref.preference.channels).length > 0);
    if (preferenceFilter && preferences) {
        preferences = preferences.filter((pref) => preferenceFilter(pref));
    }
    const styles = accordionStyles(baseTheme, common.fontFamily);
    const accordionClassNames = {
        item: css(accordionItemStyles),
        content: css(accordionContentStyles),
        control: css(accordionControlStyles),
        chevron: css(accordionChevronStyles),
    };
    const showNoSettings = !arePreferencesLoading && (preferences === null || preferences === void 0 ? void 0 : preferences.length) === 0;
    useLayoutEffect(() => {
        setFetchingStrategy({ fetchUserPreferences: true });
    }, [setFetchingStrategy]);
    return arePreferencesLoading ? (React.createElement(Loader, null)) : (React.createElement(React.Fragment, null, showNoSettings ? (React.createElement("div", { style: {
            textAlign: 'center',
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        } },
        React.createElement(NoSettings, { style: { maxWidth: 300 } }))) : (React.createElement(ScrollArea, { style: { height: 400 } },
        React.createElement("div", { className: cx('nc-preferences-root', rootClassName, css(rootStyles)) },
            React.createElement(Accordion, { chevronPosition: "right", styles: styles, classNames: accordionClassNames }, preferences === null || preferences === void 0 ? void 0 : preferences.map((preference) => (React.createElement(UserPreferenceItem, { key: preference.template._id, preferenceSettings: preference })))))))));
}
//# sourceMappingURL=SubscriberPreference.js.map