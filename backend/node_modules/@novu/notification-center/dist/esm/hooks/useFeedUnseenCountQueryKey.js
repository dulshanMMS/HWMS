import { useMemo } from 'react';
import { FEED_UNSEEN_COUNT_QUERY_KEY } from './queryKeys';
import { useSetQueryKey } from './useSetQueryKey';
export const useFeedUnseenCountQueryKey = (query) => {
    const setQueryKey = useSetQueryKey();
    const queryKey = useMemo(() => setQueryKey([...FEED_UNSEEN_COUNT_QUERY_KEY, query]), [setQueryKey, query]);
    return queryKey;
};
//# sourceMappingURL=useFeedUnseenCountQueryKey.js.map