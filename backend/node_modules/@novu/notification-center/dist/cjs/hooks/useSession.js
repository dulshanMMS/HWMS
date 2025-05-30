"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSession = void 0;
const react_query_1 = require("@tanstack/react-query");
const queryKeys_1 = require("./queryKeys");
const useNovuContext_1 = require("./useNovuContext");
const useSession = ({ onSuccess }) => {
    const { apiService, applicationIdentifier, subscriberId, subscriberHash } = (0, useNovuContext_1.useNovuContext)();
    const result = (0, react_query_1.useQuery)([...queryKeys_1.SESSION_QUERY_KEY, applicationIdentifier, subscriberId, subscriberHash], () => apiService.initializeSession(applicationIdentifier, subscriberId, subscriberHash), {
        enabled: !!applicationIdentifier && !!subscriberId,
        cacheTime: Infinity,
        staleTime: Infinity,
        onSuccess,
        onError: (error) => {
            // eslint-disable-next-line no-console
            console.error('Failed to initialize the session', error.message);
        },
    });
    return result;
};
exports.useSession = useSession;
//# sourceMappingURL=useSession.js.map