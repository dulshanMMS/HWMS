import { useQuery } from '@tanstack/react-query';
import { useNovuContext } from './useNovuContext';
import { useFetchUserPreferencesQueryKey } from './useFetchUserPreferencesQueryKey';
export const useFetchUserPreferences = (options = {}) => {
    const { apiService, isSessionInitialized, fetchingStrategy } = useNovuContext();
    const userPreferencesQueryKey = useFetchUserPreferencesQueryKey();
    const result = useQuery(userPreferencesQueryKey, () => apiService.getUserPreference(), Object.assign(Object.assign({}, options), { enabled: isSessionInitialized && fetchingStrategy.fetchUserPreferences }));
    return result;
};
//# sourceMappingURL=useFetchUserPreferences.js.map