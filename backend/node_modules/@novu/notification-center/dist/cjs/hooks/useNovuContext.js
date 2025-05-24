"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNovuContext = void 0;
const react_1 = require("react");
const novu_provider_context_1 = require("../store/novu-provider.context");
const useProviderCheck_1 = require("./useProviderCheck");
/**
 * custom hook for accessing NovuContext
 * @returns INovuProviderContext
 */
function useNovuContext() {
    const novuContext = (0, react_1.useContext)(novu_provider_context_1.NovuContext);
    const context = (0, useProviderCheck_1.useProviderCheck)(novuContext);
    return context;
}
exports.useNovuContext = useNovuContext;
//# sourceMappingURL=useNovuContext.js.map