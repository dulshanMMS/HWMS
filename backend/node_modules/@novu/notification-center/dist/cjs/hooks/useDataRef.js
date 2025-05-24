"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDataRef = void 0;
const react_1 = require("react");
const useDataRef = (data) => {
    const ref = (0, react_1.useRef)(data);
    ref.current = data;
    return ref;
};
exports.useDataRef = useDataRef;
//# sourceMappingURL=useDataRef.js.map