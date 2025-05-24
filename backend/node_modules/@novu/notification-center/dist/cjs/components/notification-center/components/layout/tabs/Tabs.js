"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tabs = void 0;
const react_1 = __importDefault(require("react"));
const core_1 = require("@mantine/core");
const css_1 = require("@emotion/css");
const Tabs_styles_1 = __importDefault(require("./Tabs.styles"));
const hooks_1 = require("../../../../../hooks");
const styles_1 = require("../../../../../store/styles");
function Tabs({ children, onTabChange, value }) {
    const { theme: novuTheme, common, colorScheme } = (0, hooks_1.useNovuTheme)();
    const { classes } = (0, Tabs_styles_1.default)({ novuTheme, common, colorScheme });
    const [tabsListStyles, tabStyles, tabLabelStyles, tabIconStyles] = (0, styles_1.useStyles)([
        'tabs.tabsList',
        'tabs.tab',
        'tabs.tabLabel',
        'tabs.tabIcon',
    ]);
    const overrideClasses = {
        tabsList: (0, css_1.cx)(classes.tabsList, (0, css_1.css)(tabsListStyles)),
        tab: (0, css_1.cx)(classes.tab, (0, css_1.css)(tabStyles)),
        tabLabel: (0, css_1.cx)(classes.tabLabel, (0, css_1.css)(tabLabelStyles)),
        tabIcon: (0, css_1.cx)(classes.tabIcon, (0, css_1.css)(tabIconStyles)),
    };
    return (react_1.default.createElement(core_1.Tabs, { onTabChange: onTabChange, defaultValue: value, keepMounted: false, variant: "default", classNames: overrideClasses }, children));
}
exports.Tabs = Tabs;
//# sourceMappingURL=Tabs.js.map