import { useQuery } from '@tanstack/react-query';
import { useNovuContext } from './useNovuContext';
import { useFeedUnseenCountQueryKey } from './useFeedUnseenCountQueryKey';
export const useFeedUnseenCount = ({ query }, options = {}) => {
    const { apiService, isSessionInitialized } = useNovuContext();
    const feedUnseenCountQueryKey = useFeedUnseenCountQueryKey(query);
    const result = useQuery(feedUnseenCountQueryKey, () => apiService.getTabCount(query), Object.assign(Object.assign({}, options), { enabled: isSessionInitialized }));
    return result;
};
//# sourceMappingURL=useFeedUnseenCount.js.map