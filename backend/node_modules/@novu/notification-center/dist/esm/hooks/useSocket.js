import { useNovuContext } from './useNovuContext';
export function useSocket() {
    const { socket } = useNovuContext();
    return {
        socket,
    };
}
//# sourceMappingURL=useSocket.js.map