"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextPageParam = void 0;
const getNextPageParam = (lastPage) => {
    return lastPage.hasMore ? lastPage.page + 1 : undefined;
};
exports.getNextPageParam = getNextPageParam;
//# sourceMappingURL=pagination.js.map