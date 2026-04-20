export type PageInfoResult = {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};

export type PageResult<T> = {
    items: T[];
    pagination: PageInfoResult;
};

export function buildPageResult<T>(items: T[], page: number, pageSize: number, totalItems: number): PageResult<T> {
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
        items,
        pagination: {
            currentPage: page,
            pageSize,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}
