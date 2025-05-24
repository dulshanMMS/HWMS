"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInitializeSocket = void 0;
const react_1 = require("react");
const socket_io_client_1 = require("socket.io-client");
const useInitializeSocket = ({ socketUrl }) => {
    const socketRef = (0, react_1.useRef)(null);
    const disconnectSocket = (0, react_1.useCallback)(() => {
        if (socketRef.current) {
            if (socketRef.current.disconnect) {
                socketRef.current.disconnect();
            }
            socketRef.current = null;
        }
    }, [socketRef]);
    const initializeSocket = (0, react_1.useCallback)(({ token }) => {
        if (socketRef.current) {
            disconnectSocket();
        }
        if (token) {
            socketRef.current = (0, socket_io_client_1.io)(socketUrl, {
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
exports.useInitializeSocket = useInitializeSocket;
//# sourceMappingURL=useInitializeSocket.js.map