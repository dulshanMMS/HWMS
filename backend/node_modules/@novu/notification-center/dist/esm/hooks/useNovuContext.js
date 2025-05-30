import { useContext } from 'react';
import { NovuContext } from '../store/novu-provider.context';
import { useProviderCheck } from './useProviderCheck';
/**
 * custom hook for accessing NovuContext
 * @returns INovuProviderContext
 */
export function useNovuContext() {
    const novuContext = useContext(NovuContext);
    const context = useProviderCheck(novuContext);
    return context;
}
//# sourceMappingURL=useNovuContext.js.map