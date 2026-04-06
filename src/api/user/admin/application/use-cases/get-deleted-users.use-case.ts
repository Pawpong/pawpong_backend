import { Inject, Injectable } from '@nestjs/common';

import { AdminAction, AdminTargetType } from '../../../../../common/enum/user.enum';
import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { DeletedUserSearchRequestDto } from '../../dto/request/deleted-user-search-request.dto';
import { DeletedUserResponseDto } from '../../dto/response/deleted-user-response.dto';
import { USER_ADMIN_READER, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { USER_ADMIN_WRITER, type UserAdminWriterPort } from '../ports/user-admin-writer.port';
import { UserAdminActivityLogFactoryService } from '../../domain/services/user-admin-activity-log-factory.service';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import { UserAdminPresentationService } from '../../domain/services/user-admin-presentation.service';

@Injectable()
export class GetDeletedUsersUseCase {
    constructor(
        @Inject(USER_ADMIN_READER)
        private readonly userAdminReader: UserAdminReaderPort,
        @Inject(USER_ADMIN_WRITER)
        private readonly userAdminWriter: UserAdminWriterPort,
        private readonly userAdminCommandPolicyService: UserAdminCommandPolicyService,
        private readonly userAdminActivityLogFactoryService: UserAdminActivityLogFactoryService,
        private readonly userAdminPresentationService: UserAdminPresentationService,
    ) {}

    async execute(
        adminId: string,
        filter: DeletedUserSearchRequestDto,
    ): Promise<PaginationResponseDto<DeletedUserResponseDto>> {
        this.userAdminCommandPolicyService.assertCanManageUsers(
            await this.userAdminReader.findAdminById(adminId),
            '사용자 관리 권한이 없습니다.',
        );

        const page = filter.page ?? 1;
        const limit = filter.limit ?? 20;
        const role = filter.role ?? 'all';

        const result = await this.userAdminReader.getDeletedUsers({
            role,
            deleteReason: filter.deleteReason,
            page,
            limit,
        });

        await this.userAdminWriter.appendAdminActivityLog(
            adminId,
            this.userAdminActivityLogFactoryService.create(
                AdminAction.VIEW_USER_LIST,
                AdminTargetType.SYSTEM,
                'deleted-users',
                undefined,
                `탈퇴 사용자 목록 조회 (role: ${role}, page: ${page})`,
            ),
        );

        return this.userAdminPresentationService.toDeletedUsersPaginationResponse(result, page, limit);
    }
}
