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
exports.StoreProvider = void 0;
const react_1 = __importStar(require("react"));
const store_context_1 = require("./store.context");
const StoreProvider = ({ children, stores }) => {
    var _a;
    const firstStore = stores[0];
    const [storeQuery, setStoreQuery] = (0, react_1.useState)(() => { var _a; return (_a = firstStore.query) !== null && _a !== void 0 ? _a : {}; });
    const [storeId, setStoreId] = (0, react_1.useState)((_a = firstStore.storeId) !== null && _a !== void 0 ? _a : 'default_store');
    const setStore = (0, react_1.useCallback)((newStoreId) => {
        var _a;
        const foundQuery = ((_a = stores === null || stores === void 0 ? void 0 : stores.find((store) => store.storeId === newStoreId)) === null || _a === void 0 ? void 0 : _a.query) || {};
        setStoreId(newStoreId);
        setStoreQuery(foundQuery);
    }, [stores, setStoreId, setStoreQuery]);
    const contextValue = (0, react_1.useMemo)(() => ({
        storeQuery,
        storeId,
        stores,
        setStore,
    }), [storeQuery, storeId, stores, setStore]);
    return react_1.default.createElement(store_context_1.StoreContext.Provider, { value: contextValue }, children);
};
exports.StoreProvider = StoreProvider;
//# sourceMappingURL=store-provider.context.js.map