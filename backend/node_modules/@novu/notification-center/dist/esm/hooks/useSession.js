import { useQuery } from '@tanstack/react-query';
import { SESSION_QUERY_KEY } from './queryKeys';
import { useNovuContext } from './useNovuContext';
export const useSession = ({ onSuccess }) => {
    const { apiService, applicationIdentifier, subscriberId, subscriberHash } = useNovuContext();
    const result = useQuery([...SESSION_QUERY_KEY, applicationIdentifier, subscriberId, subscriberHash], () => apiService.initializeSession(applicationIdentifier, subscriberId, subscriberHash), {
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
//# sourceMappingURL=useSession.js.map