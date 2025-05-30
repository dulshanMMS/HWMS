"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStore = void 0;
const react_1 = require("react");
const store_context_1 = require("../store/store.context");
const useStore = () => {
    return (0, react_1.useContext)(store_context_1.StoreContext);
};
exports.useStore = useStore;
//# sourceMappingURL=useStore.js.map