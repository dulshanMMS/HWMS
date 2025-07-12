"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultBellColors = exports.getDefaultTheme = void 0;
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
const themeDefaultValues_1 = require("../shared/config/themeDefaultValues");
function getDefaultTheme(props) {
    var _a, _b, _c;
    const theme = props.colorScheme === 'light'
        ? (0, lodash_merge_1.default)((0, lodash_clonedeep_1.default)(themeDefaultValues_1.defaultLightTheme), (_a = props === null || props === void 0 ? void 0 : props.theme) === null || _a === void 0 ? void 0 : _a.light)
        : (0, lodash_merge_1.default)((0, lodash_clonedeep_1.default)(themeDefaultValues_1.defaultDarkTheme), (_b = props === null || props === void 0 ? void 0 : props.theme) === null || _b === void 0 ? void 0 : _b.dark);
    const common = (0, lodash_merge_1.default)((0, lodash_clonedeep_1.default)(themeDefaultValues_1.defaultCommonTheme), (_c = props === null || props === void 0 ? void 0 : props.theme) === null || _c === void 0 ? void 0 : _c.common);
    return {
        theme,
        common,
    };
}
exports.getDefaultTheme = getDefaultTheme;
function getDefaultBellColors(props) {
    const colorScheme = (props === null || props === void 0 ? void 0 : props.colorScheme) ? props === null || props === void 0 ? void 0 : props.colorScheme : 'light';
    const bellColors = colorScheme === 'light'
        ? Object.assign(Object.assign({}, (0, lodash_clonedeep_1.default)(themeDefaultValues_1.defaultNotificationBellLightTheme)), { bellColors: props === null || props === void 0 ? void 0 : props.bellColors }) : Object.assign(Object.assign({}, (0, lodash_clonedeep_1.default)(themeDefaultValues_1.defaultNotificationBellDarkTheme)), { bellColors: props === null || props === void 0 ? void 0 : props.bellColors });
    return {
        bellColors,
    };
}
exports.getDefaultBellColors = getDefaultBellColors;
//# sourceMappingURL=defaultTheme.js.map