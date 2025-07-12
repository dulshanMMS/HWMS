var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from 'react';
import { TRANSLATIONS } from '../i18n/lang';
export const I18NContext = React.createContext({
    translations: {
        markAllAsRead: '',
        notifications: '',
        poweredBy: '',
        settings: '',
        removeMessage: '',
        markAsRead: '',
        markAsUnRead: '',
    },
    lang: '',
});
export function NovuI18NProvider(_a) {
    var { i18n = 'en' } = _a, props = __rest(_a, ["i18n"]);
    const i18nEntry = React.useMemo(() => {
        if (typeof i18n === 'string') {
            return {
                translations: TRANSLATIONS[i18n].translations,
                lang: i18n,
            };
        }
        return i18n;
    }, [i18n]);
    return React.createElement(I18NContext.Provider, Object.assign({}, props, { value: i18nEntry }));
}
//# sourceMappingURL=i18n.context.js.map