"use strict";
/**
 * Custom hook to check if the context Consumer is wrapped inside the ContextProvider
 * @param context
 * @returns context
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProviderCheck = void 0;
function useProviderCheck(context) {
    if (context === null || context === undefined) {
        throw new Error('Component must be wrapped within the NovuProvider before using hooks from @novu/notification-center');
    }
    return context;
}
exports.useProviderCheck = useProviderCheck;
//# sourceMappingURL=useProviderCheck.js.map