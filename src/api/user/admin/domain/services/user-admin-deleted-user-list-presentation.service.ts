import { Injectable } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { DeletedUserResponseDto } from '../../dto/response/deleted-user-response.dto';
import { UserAdminDeletedUserListResultSnapshot } from '../../application/ports/user-admin-reader.port';
import { UserAdminPaginationAssemblerService } from './user-admin-pagination-assembler.service';

@Injectable()
export class UserAdminDeletedUserListPresentationService {
    constructor(private readonly userAdminPaginationAssemblerService: UserAdminPaginationAssemblerService) {}

    toDeletedUsersPaginationResponse(
        result: UserAdminDeletedUserListResultSnapshot,
        page: number,
        limit: number,
    ): PaginationResponseDto<DeletedUserResponseDto> {
        const items = result.items.map(
            (user): DeletedUserResponseDto => ({
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
