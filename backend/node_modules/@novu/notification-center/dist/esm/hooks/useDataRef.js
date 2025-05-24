import { useRef } from 'react';
export const useDataRef = (data) => {
    const ref = useRef(data);
    ref.current = data;
    return ref;
};
//# sourceMappingURL=useDataRef.js.map