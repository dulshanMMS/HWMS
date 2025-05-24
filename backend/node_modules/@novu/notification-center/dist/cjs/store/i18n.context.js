"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovuI18NProvider = exports.I18NContext = void 0;
const react_1 = __importDefault(require("react"));
const lang_1 = require("../i18n/lang");
exports.I18NContext = react_1.default.createContext({
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
function NovuI18NProvider(_a) {
    var { i18n = 'en' } = _a, props = __rest(_a, ["i18n"]);
    const i18nEntry = react_1.default.useMemo(() => {
        if (typeof i18n === 'string') {
            return {
                translations: lang_1.TRANSLATIONS[i18n].translations,
                lang: i18n,
            };
        }
        return i18n;
    }, [i18n]);
    return react_1.default.createElement(exports.I18NContext.Provider, Object.assign({}, props, { value: i18nEntry }));
}
exports.NovuI18NProvider = NovuI18NProvider;
//# sourceMappingURL=i18n.context.js.map