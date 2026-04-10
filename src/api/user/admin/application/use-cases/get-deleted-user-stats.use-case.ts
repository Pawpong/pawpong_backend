import { Inject, Injectable } from '@nestjs/common';

import { AdminAction, AdminTargetType } from '../../../../../common/enum/user.enum';
import { USER_ADMIN_READER, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { USER_ADMIN_WRITER, type UserAdminWriterPort } from '../ports/user-admin-writer.port';
import { UserAdminActivityLogFactoryService } from '../../domain/services/user-admin-activity-log-factory.service';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import { UserAdminDeletedUserStatsPresentationService } from '../../domain/services/user-admin-deleted-user-stats-presentation.service';
import type { UserAdminDeletedUserStatsResult } from '../types/user-admin-result.type';

@Injectable()
export class GetDeletedUserStatsUseCase {
    constructor(
        @Inject(USER_ADMIN_READER)
        private readonly userAdminReader: UserAdminReaderPort,
        @Inject(USER_ADMIN_WRITER)
        private readonly userAdminWriter: UserAdminWriterPort,
        private readonly userAdminCommandPolicyService: UserAdminCommandPolicyService,
        private readonly userAdminActivityLogFactoryService: UserAdminActivityLogFactoryService,
        private readonly userAdminDeletedUserStatsPresentationService: UserAdminDeletedUserStatsPresentationService,
    ) {}

    async execute(adminId: string): Promise<UserAdminDeletedUserStatsResult> {
        this.userAdminCommandPolicyService.assertCanManageUsers(
            await this.userAdminReader.findAdminById(adminId),
            '사용자 관리 권한이 없습니다.',
        );

        const result = await this.userAdminReader.getDeletedUserStats();

        await this.userAdminWriter.appendAdminActivityLog(
            adminId,
            this.userAdminActivityLogFactoryService.create(
                AdminAction.VIEW_STATISTICS,
                AdminTargetType.SYSTEM,
                'deleted-users-stats',
                undefined,
                '탈퇴 사용자 통계 조회',
            ),
        );

        return this.userAdminDeletedUserStatsPresentationService.toDeletedUserStatsResponse(result);
    }
}
