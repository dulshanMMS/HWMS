"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberPreference = void 0;
const react_1 = __importStar(require("react"));
const core_1 = require("@mantine/core");
const css_1 = require("@emotion/css");
const hooks_1 = require("../../../../hooks");
const styles_1 = require("./styles");
const styles_2 = require("../../../../store/styles");
const UserPreferenceItem_1 = require("./UserPreferenceItem");
const Loader_1 = require("../Loader");
const NoSettings_1 = require("../../../../images/NoSettings");
const rootClassName = (0, css_1.css) `
  padding: 15px;
`;
function SubscriberPreference() {
    var _a;
    const { setFetchingStrategy } = (0, hooks_1.useNovuContext)();
    const { theme, common } = (0, hooks_1.useNovuTheme)();
    const { data, isLoading: arePreferencesLoading } = (0, hooks_1.useFetchUserPreferences)();
    const { preferenceFilter } = (0, hooks_1.useNotificationCenter)();
    const [rootStyles, accordionItemStyles, accordionContentStyles, accordionControlStyles, accordionChevronStyles] = (0, styles_2.useStyles)(['preferences.root', 'accordion.item', 'accordion.content', 'accordion.control', 'accordion.chevron']);
    const baseTheme = theme === null || theme === void 0 ? void 0 : theme.userPreferences;
    let preferences = (_a = data === null || data === void 0 ? void 0 : data.filter((item) => !item.template.critical)) === null || _a === void 0 ? void 0 : _a.filter((pref) => Object.keys(pref.preference.channels).length > 0);
    if (preferenceFilter && preferences) {
        preferences = preferences.filter((pref) => preferenceFilter(pref));
    }
    const styles = (0, styles_1.accordionStyles)(baseTheme, common.fontFamily);
    const accordionClassNames = {
        item: (0, css_1.css)(accordionItemStyles),
        content: (0, css_1.css)(accordionContentStyles),
        control: (0, css_1.css)(accordionControlStyles),
        chevron: (0, css_1.css)(accordionChevronStyles),
    };
    const showNoSettings = !arePreferencesLoading && (preferences === null || preferences === void 0 ? void 0 : preferences.length) === 0;
    (0, react_1.useLayoutEffect)(() => {
        setFetchingStrategy({ fetchUserPreferences: true });
    }, [setFetchingStrategy]);
    return arePreferencesLoading ? (react_1.default.createElement(Loader_1.Loader, null)) : (react_1.default.createElement(react_1.default.Fragment, null, showNoSettings ? (react_1.default.createElement("div", { style: {
            textAlign: 'center',
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        } },
        react_1.default.createElement(NoSettings_1.NoSettings, { style: { maxWidth: 300 } }))) : (react_1.default.createElement(core_1.ScrollArea, { style: { height: 400 } },
        react_1.default.createElement("div", { className: (0, css_1.cx)('nc-preferences-root', rootClassName, (0, css_1.css)(rootStyles)) },
            react_1.default.createElement(core_1.Accordion, { chevronPosition: "right", styles: styles, classNames: accordionClassNames }, preferences === null || preferences === void 0 ? void 0 : preferences.map((preference) => (react_1.default.createElement(UserPreferenceItem_1.UserPreferenceItem, { key: preference.template._id, preferenceSettings: preference })))))))));
}
exports.SubscriberPreference = SubscriberPreference;
//# sourceMappingURL=SubscriberPreference.js.map