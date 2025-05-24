"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocket = void 0;
const useNovuContext_1 = require("./useNovuContext");
function useSocket() {
    const { socket } = (0, useNovuContext_1.useNovuContext)();
    return {
        socket,
    };
}
exports.useSocket = useSocket;
//# sourceMappingURL=useSocket.js.map