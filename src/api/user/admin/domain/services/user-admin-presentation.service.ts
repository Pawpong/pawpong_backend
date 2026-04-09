import { Injectable } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { UserManagementResponseDto } from '../../dto/response/user-management-response.dto';
import {
    UserAdminAdminSnapshot,
    UserAdminUserListResultSnapshot,
} from '../../application/ports/user-admin-reader.port';
import { UserAdminPaginationAssemblerService } from './user-admin-pagination-assembler.service';

@Injectable()
export class UserAdminPresentationService {
    constructor(private readonly userAdminPaginationAssemblerService: UserAdminPaginationAssemblerService) {}

    toAdminProfileResponse(admin: UserAdminAdminSnapshot): any {
        return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            profileImage: admin.profileImage,
            status: admin.status,
            adminLevel: admin.adminLevel,
            permissions: admin.permissions,
            activityLogs: admin.activityLogs?.slice(-10) || [],
            createdAt: admin.createdAt,
        };
    }

    toUsersPaginationResponse(
        result: UserAdminUserListResultSnapshot,
        page: number,
        limit: number,
    ): PaginationResponseDto<UserManagementResponseDto> {
        const items = result.items.map(
            (user): UserManagementResponseDto => ({
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
