import { Injectable } from '@nestjs/common';

import { UserAdminUserListResultSnapshot } from '../../application/ports/user-admin-reader.port';
import { UserAdminPaginationAssemblerService } from './user-admin-pagination-assembler.service';
import type {
    UserAdminUserManagementItemResult,
    UserAdminUserManagementPageResult,
} from '../../application/types/user-admin-result.type';

@Injectable()
export class UserAdminUserPageAssemblerService {
    constructor(private readonly userAdminPaginationAssemblerService: UserAdminPaginationAssemblerService) {}

    build(
        result: UserAdminUserListResultSnapshot,
        page: number,
        limit: number,
    ): UserAdminUserManagementPageResult {
        const items = result.items.map(
            (user): UserAdminUserManagementItemResult => ({
                userId: user.id,
                userName: user.nickname || user.name || '',
                emailAddress: user.emailAddress,
                userRole: user.role,
                accountStatus: user.accountStatus,
                lastLoginAt: user.lastLoginAt as Date,
                createdAt: user.createdAt as Date,
                statisticsInfo: user.stats,
            }),
        );

        return this.userAdminPaginationAssemblerService.build(items, page, limit, result.total);
    }
}
