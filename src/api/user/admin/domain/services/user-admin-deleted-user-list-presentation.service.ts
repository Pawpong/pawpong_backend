import { Injectable } from '@nestjs/common';

import { UserAdminDeletedUserListResultSnapshot } from '../../application/ports/user-admin-reader.port';
import { UserAdminPaginationAssemblerService } from './user-admin-pagination-assembler.service';
import type {
    UserAdminDeletedUserItemResult,
    UserAdminDeletedUserPageResult,
} from '../../application/types/user-admin-result.type';

@Injectable()
export class UserAdminDeletedUserListPresentationService {
    constructor(private readonly userAdminPaginationAssemblerService: UserAdminPaginationAssemblerService) {}

    toDeletedUsersPaginationResponse(
        result: UserAdminDeletedUserListResultSnapshot,
        page: number,
        limit: number,
    ): UserAdminDeletedUserPageResult {
        const items = result.items.map(
            (user): UserAdminDeletedUserItemResult => ({
                userId: user.id,
                email: user.emailAddress,
                nickname: user.nickname || '',
                userRole: user.userRole,
                deleteReason: user.deleteReason || '',
                deleteReasonDetail: user.deleteReasonDetail,
                deletedAt: user.deletedAt ? new Date(user.deletedAt).toISOString() : '',
                createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : '',
                phone: user.phoneNumber,
            }),
        );

        return this.userAdminPaginationAssemblerService.build(items, page, limit, result.total);
    }
}
