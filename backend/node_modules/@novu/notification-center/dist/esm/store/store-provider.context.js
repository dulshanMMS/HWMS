import React, { useState, useCallback, useMemo } from 'react';
import { StoreContext } from './store.context';
export const StoreProvider = ({ children, stores }) => {
    var _a;
    const firstStore = stores[0];
    const [storeQuery, setStoreQuery] = useState(() => { var _a; return (_a = firstStore.query) !== null && _a !== void 0 ? _a : {}; });
    const [storeId, setStoreId] = useState((_a = firstStore.storeId) !== null && _a !== void 0 ? _a : 'default_store');
    const setStore = useCallback((newStoreId) => {
        var _a;
        const foundQuery = ((_a = stores === null || stores === void 0 ? void 0 : stores.find((store) => store.storeId === newStoreId)) === null || _a === void 0 ? void 0 : _a.query) || {};
        setStoreId(newStoreId);
        setStoreQuery(foundQuery);
    }, [stores, setStoreId, setStoreQuery]);
    const contextValue = useMemo(() => ({
        storeQuery,
        storeId,
        stores,
        setStore,
    }), [storeQuery, storeId, stores, setStore]);
    return React.createElement(StoreContext.Provider, { value: contextValue }, children);
};
//# sourceMappingURL=store-provider.context.js.map