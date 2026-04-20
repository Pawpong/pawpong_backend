import { Injectable } from '@nestjs/common';

@Injectable()
export class AppVersionAdminPaginationAssemblerService {
    build<T>(items: T[], page: number, limit: number, totalItems: number) {
        const totalPages = Math.ceil(totalItems / limit);

        return {
            items,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
}
