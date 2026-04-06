import { Inject, Injectable } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { UserManagementResponseDto } from '../../dto/response/user-management-response.dto';
import { UserSearchRequestDto } from '../../dto/request/user-search-request.dto';
import { USER_ADMIN_READER, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import { UserAdminPresentationService } from '../../domain/services/user-admin-presentation.service';

@Injectable()
export class GetUsersUseCase {
    constructor(
        @Inject(USER_ADMIN_READER)
        private readonly userAdminReader: UserAdminReaderPort,
        private readonly userAdminCommandPolicyService: UserAdminCommandPolicyService,
        private readonly userAdminPresentationService: UserAdminPresentationService,
    ) {}

    async execute(
        adminId: string,
        filter: UserSearchRequestDto,
    ): Promise<PaginationResponseDto<UserManagementResponseDto>> {
        this.userAdminCommandPolicyService.assertCanManageUsers(
            await this.userAdminReader.findAdminById(adminId),
            'Access denied',
        );

        const page = filter.page ?? 1;
        const limit = filter.limit ?? 10;
        const result = await this.userAdminReader.getUsers({
            userRole: filter.userRole as 'adopter' | 'breeder' | undefined,
            accountStatus: filter.accountStatus,
            searchKeyword: filter.searchKeyword,
            page,
            limit,
        });

        return this.userAdminPresentationService.toUsersPaginationResponse(result, page, limit);
    }
}
