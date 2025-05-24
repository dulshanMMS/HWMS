import { useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
export const useInitializeSocket = ({ socketUrl }) => {
    const socketRef = useRef(null);
    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            if (socketRef.current.disconnect) {
                socketRef.current.disconnect();
            }
            socketRef.current = null;
        }
    }, [socketRef]);
    const initializeSocket = useCallback(({ token }) => {
        if (socketRef.current) {
            disconnectSocket();
        }
        if (token) {
            socketRef.current = io(socketUrl, {
                reconnectionDelayMax: 10000,
                transports: ['websocket'],
                auth: {
                    token: `${token}`,
                },
            });
            socketRef.current.on('connect_error', (error) => {
                // eslint-disable-next-line no-console
                console.error(error.message);
            });
        }
    }, [socketRef, disconnectSocket]);
    return {
        socket: socketRef.current,
        initializeSocket,
        disconnectSocket,
    };
};
//# sourceMappingURL=useInitializeSocket.js.map