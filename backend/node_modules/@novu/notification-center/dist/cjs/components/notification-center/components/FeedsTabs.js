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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedsTabs = void 0;
const react_1 = __importStar(require("react"));
const core_1 = require("@mantine/core");
const styled_1 = __importDefault(require("@emotion/styled"));
const NotificationsListTab_1 = require("./NotificationsListTab");
const UnseenBadge_1 = require("./UnseenBadge");
const Tabs_1 = require("./layout/tabs/Tabs");
const hooks_1 = require("../../../hooks");
function FeedsTabs() {
    const { tabs, onTabClick } = (0, hooks_1.useNotificationCenter)();
    const { storeId, setStore, markFetchedNotificationsAsSeen } = (0, hooks_1.useNotifications)();
    const { setFetchingStrategy } = (0, hooks_1.useNovuContext)();
    function handleOnTabChange(newStoreId) {
        return __awaiter(this, void 0, void 0, function* () {
            markFetchedNotificationsAsSeen();
            setStore(newStoreId);
        });
    }
    (0, react_1.useLayoutEffect)(() => {
        setFetchingStrategy({ fetchNotifications: true });
    }, [setFetchingStrategy]);
    return (react_1.default.createElement(react_1.default.Fragment, null, (tabs === null || tabs === void 0 ? void 0 : tabs.length) ? (react_1.default.createElement(Tabs_1.Tabs, { value: storeId, onTabChange: handleOnTabChange },
        react_1.default.createElement(core_1.Tabs.List, null, tabs.map((tab, index) => (react_1.default.createElement(core_1.Tabs.Tab, { onClick: () => {
                onTabClick(tab);
            }, key: index, "data-test-id": `tab-${tab.storeId}`, value: tab.storeId },
            react_1.default.createElement(TabLabelWrapper, null,
                tab.name,
                react_1.default.createElement(UnseenBadgeContainer, { storeId: tab.storeId })))))),
        tabs.map((tab, index) => (react_1.default.createElement(core_1.Tabs.Panel, { value: tab.storeId, key: index },
            react_1.default.createElement(NotificationsListTab_1.NotificationsListTab, null)))))) : (react_1.default.createElement(NotificationsListTab_1.NotificationsListTab, null))));
}
exports.FeedsTabs = FeedsTabs;
const TabLabelWrapper = styled_1.default.div `
  margin-bottom: 13px;
  min-height: 22px;
  line-height: 19px;
`;
function UnseenBadgeContainer({ storeId }) {
    var _a;
    const { stores } = (0, hooks_1.useNotifications)();
    const query = (0, react_1.useMemo)(() => {
        var _a;
        const foundQuery = ((_a = stores === null || stores === void 0 ? void 0 : stores.find((i) => i.storeId === storeId)) === null || _a === void 0 ? void 0 : _a.query) || {};
        return Object.assign({}, foundQuery, { seen: false, limit: 100 });
    }, [stores]);
    const { data } = (0, hooks_1.useFeedUnseenCount)({ query });
    const unseenCount = query.seen ? 0 : (_a = data === null || data === void 0 ? void 0 : data.count) !== null && _a !== void 0 ? _a : 0;
    return react_1.default.createElement(UnseenBadge_1.UnseenBadge, { unseenCount: unseenCount });
}
//# sourceMappingURL=FeedsTabs.js.map