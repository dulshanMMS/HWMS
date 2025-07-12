"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTranslations = void 0;
const react_1 = require("react");
const lang_1 = require("../i18n/lang");
const i18n_context_1 = require("../store/i18n.context");
function useTranslations() {
    const { translations, lang } = (0, react_1.useContext)(i18n_context_1.I18NContext);
    return {
        lang,
        t: (key) => {
            /**
             * Fallback to english when a key for a specified languages does not exist
             */
            return translations[key] || lang_1.TRANSLATIONS.en.translations[key];
        },
    };
}
exports.useTranslations = useTranslations;
//# sourceMappingURL=useTranslations.js.map