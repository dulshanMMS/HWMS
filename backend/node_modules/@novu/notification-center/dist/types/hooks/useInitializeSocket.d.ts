import type { Socket, ISession } from '../shared/interfaces';
type IUseInitializeSocket = (args: {
    socketUrl: string;
}) => {
    socket: Socket | undefined;
    initializeSocket: (args: ISession) => void;
    disconnectSocket: () => void;
};
export declare const useInitializeSocket: IUseInitializeSocket;
export {};
//# sourceMappingURL=useInitializeSocket.d.ts.map