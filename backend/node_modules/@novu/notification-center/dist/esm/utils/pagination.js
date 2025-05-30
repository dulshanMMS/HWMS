export const getNextPageParam = (lastPage) => {
    return lastPage.hasMore ? lastPage.page + 1 : undefined;
};
//# sourceMappingURL=pagination.js.map