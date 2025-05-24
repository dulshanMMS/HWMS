import merge from 'lodash.merge';
import cloneDeep from 'lodash.clonedeep';
import { defaultCommonTheme, defaultDarkTheme, defaultLightTheme, defaultNotificationBellDarkTheme, defaultNotificationBellLightTheme, } from '../shared/config/themeDefaultValues';
export function getDefaultTheme(props) {
    var _a, _b, _c;
    const theme = props.colorScheme === 'light'
        ? merge(cloneDeep(defaultLightTheme), (_a = props === null || props === void 0 ? void 0 : props.theme) === null || _a === void 0 ? void 0 : _a.light)
        : merge(cloneDeep(defaultDarkTheme), (_b = props === null || props === void 0 ? void 0 : props.theme) === null || _b === void 0 ? void 0 : _b.dark);
    const common = merge(cloneDeep(defaultCommonTheme), (_c = props === null || props === void 0 ? void 0 : props.theme) === null || _c === void 0 ? void 0 : _c.common);
    return {
        theme,
        common,
    };
}
export function getDefaultBellColors(props) {
    const colorScheme = (props === null || props === void 0 ? void 0 : props.colorScheme) ? props === null || props === void 0 ? void 0 : props.colorScheme : 'light';
    const bellColors = colorScheme === 'light'
        ? Object.assign(Object.assign({}, cloneDeep(defaultNotificationBellLightTheme)), { bellColors: props === null || props === void 0 ? void 0 : props.bellColors }) : Object.assign(Object.assign({}, cloneDeep(defaultNotificationBellDarkTheme)), { bellColors: props === null || props === void 0 ? void 0 : props.bellColors });
    return {
        bellColors,
    };
}
//# sourceMappingURL=defaultTheme.js.map