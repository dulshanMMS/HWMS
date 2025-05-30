import { useQuery } from '@tanstack/react-query';
import { useNovuContext } from './useNovuContext';
import { ORGANIZATION_QUERY_KEY } from './queryKeys';
import { useSetQueryKey } from './useSetQueryKey';
export const useFetchOrganization = (options = {}) => {
    const { apiService, isSessionInitialized, fetchingStrategy } = useNovuContext();
    const setQueryKey = useSetQueryKey();
    const result = useQuery(setQueryKey(ORGANIZATION_QUERY_KEY), () => apiService.getOrganization(), Object.assign(Object.assign({}, options), { enabled: isSessionInitialized && fetchingStrategy.fetchOrganization }));
    return result;
};
//# sourceMappingURL=useFetchOrganization.js.map