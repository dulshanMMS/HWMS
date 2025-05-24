"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSetQueryKey = void 0;
const react_1 = require("react");
const useNovuContext_1 = require("./useNovuContext");
const useSetQueryKey = () => {
    const { subscriberId, subscriberHash, applicationIdentifier } = (0, useNovuContext_1.useNovuContext)();
    const setQueryKey = (0, react_1.useCallback)((queryKeys) => [...queryKeys, subscriberId, applicationIdentifier, subscriberHash], [subscriberId, subscriberHash, applicationIdentifier]);
    return setQueryKey;
};
exports.useSetQueryKey = useSetQueryKey;
//# sourceMappingURL=useSetQueryKey.js.map