import { useCallback } from 'react';
import { useNovuContext } from './useNovuContext';
export const useSetQueryKey = () => {
    const { subscriberId, subscriberHash, applicationIdentifier } = useNovuContext();
    const setQueryKey = useCallback((queryKeys) => [...queryKeys, subscriberId, applicationIdentifier, subscriberHash], [subscriberId, subscriberHash, applicationIdentifier]);
    return setQueryKey;
};
//# sourceMappingURL=useSetQueryKey.js.map