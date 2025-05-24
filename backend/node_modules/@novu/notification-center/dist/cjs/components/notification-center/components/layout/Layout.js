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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layout = void 0;
const react_1 = __importStar(require("react"));
const styled_1 = __importDefault(require("@emotion/styled"));
const css_1 = require("@emotion/css");
const Header_1 = require("./header/Header");
const UserPreferenceHeader_1 = require("./header/UserPreferenceHeader");
const FooterContainer_1 = require("./footer/FooterContainer");
const Loader_1 = require("../Loader");
const hooks_1 = require("../../../../hooks");
const SubscriberPreference_1 = require("../user-preference/SubscriberPreference");
const FeedsTabs_1 = require("../FeedsTabs");
const styles_1 = require("../../../../store/styles");
const interfaces_1 = require("../../../../shared/interfaces");
function Layout() {
    const { header } = (0, hooks_1.useNotificationCenter)();
    const { isSessionInitialized } = (0, hooks_1.useNovuContext)();
    const { theme } = (0, hooks_1.useNovuTheme)();
    const [layoutStyles] = (0, styles_1.useStyles)(['layout.root']);
    const [screen, setScreen] = (0, react_1.useState)(interfaces_1.ScreensEnum.NOTIFICATIONS);
    return (react_1.default.createElement("div", { className: (0, css_1.cx)('nc-layout-wrapper', layoutWrapperCss(theme), (0, css_1.css)(layoutStyles)), "data-test-id": "layout-wrapper" },
        screen === interfaces_1.ScreensEnum.SETTINGS ? (react_1.default.createElement(react_1.default.Fragment, null,
            header ? (header({ setScreen, screen })) : (react_1.default.createElement(UserPreferenceHeader_1.UserPreferenceHeader, { onBackClick: () => setScreen(interfaces_1.ScreensEnum.NOTIFICATIONS) })),
            react_1.default.createElement(ContentWrapper, null,
                react_1.default.createElement(SubscriberPreference_1.SubscriberPreference, null)))) : (react_1.default.createElement(react_1.default.Fragment, null,
            header ? header({ setScreen, screen }) : react_1.default.createElement(Header_1.Header, { onCogClick: () => setScreen(interfaces_1.ScreensEnum.SETTINGS) }),
            react_1.default.createElement(ContentWrapper, null, isSessionInitialized ? (react_1.default.createElement(MainWrapper, { "data-test-id": "main-wrapper" },
                react_1.default.createElement(FeedsTabs_1.FeedsTabs, null))) : (react_1.default.createElement(Loader_1.Loader, null))))),
        react_1.default.createElement(FooterContainer_1.FooterContainer, null)));
}
exports.Layout = Layout;
const ContentWrapper = styled_1.default.div `
  overflow: auto;
  min-height: 400px;
`;
const layoutWrapperCss = (novuTheme) => (0, css_1.css) `
  padding: 15px 0;
  height: auto;
  border-radius: 7px;
  box-shadow: ${novuTheme.layout.boxShadow};
  background: ${novuTheme.layout.background};
`;
const MainWrapper = styled_1.default.div ``;
//# sourceMappingURL=Layout.js.map