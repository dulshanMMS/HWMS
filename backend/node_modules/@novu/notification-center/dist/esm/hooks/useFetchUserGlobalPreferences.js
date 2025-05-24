import { useQuery } from '@tanstack/react-query';
import { useFetchUserGlobalPreferencesQueryKey } from './useFetchUserGlobalPreferencesQueryKey';
import { useNovuContext } from './useNovuContext';
export const useFetchUserGlobalPreferences = (options = {}) => {
    const { apiService, isSessionInitialized, fetchingStrategy } = useNovuContext();
    const userGlobalPreferencesQueryKey = useFetchUserGlobalPreferencesQueryKey();
    const result = useQuery(userGlobalPreferencesQueryKey, () => apiService.getUserGlobalPreference(), Object.assign(Object.assign({}, options), { enabled: isSessionInitialized && fetchingStrategy.fetchUserGlobalPreferences }));
    return result;
};
//# sourceMappingURL=useFetchUserGlobalPreferences.js.map