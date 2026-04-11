import { Inject, Injectable } from '@nestjs/common';

import { AdminAction, UserStatus } from '../../../../../common/enum/user.enum';
import { USER_ADMIN_READER_PORT, type UserAdminManagedUserRole, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { USER_ADMIN_WRITER_PORT, type UserAdminWriterPort } from '../ports/user-admin-writer.port';
import { UserAdminActivityLogFactoryService } from '../../domain/services/user-admin-activity-log-factory.service';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import { UserAdminDeletedUserCommandResponseService } from '../../domain/services/user-admin-deleted-user-command-response.service';
import type { UserAdminStatusUpdateResult } from '../types/user-admin-result.type';

@Injectable()
export class RestoreDeletedUserUseCase {
    constructor(
        @Inject(USER_ADMIN_READER_PORT)
        private readonly userAdminReader: UserAdminReaderPort,
        @Inject(USER_ADMIN_WRITER_PORT)
        private readonly userAdminWriter: UserAdminWriterPort,
        private readonly userAdminCommandPolicyService: UserAdminCommandPolicyService,
        private readonly userAdminActivityLogFactoryService: UserAdminActivityLogFactoryService,
        private readonly userAdminDeletedUserCommandResponseService: UserAdminDeletedUserCommandResponseService,
    ) {}

    async execute(adminId: string, userId: string, role: UserAdminManagedUserRole): Promise<UserAdminStatusUpdateResult> {
        this.userAdminCommandPolicyService.assertCanManageUsers(
            await this.userAdminReader.findAdminById(adminId),
            '사용자 관리 권한이 없습니다.',
        );

        const user = this.userAdminCommandPolicyService.assertManagedUserExists(
            role,
            await this.userAdminReader.findManagedUserById(role, userId),
        );

        this.userAdminCommandPolicyService.assertDeletedUser(user);

        const previousStatus = user.accountStatus;
        const updatedAt = new Date();

        await this.userAdminWriter.updateManagedUser(role, userId, {
            accountStatus: UserStatus.ACTIVE,
            deletedAt: undefined,
            deleteReason: undefined,
            deleteReasonDetail: undefined,
        });

        await this.userAdminWriter.appendAdminActivityLog(
            adminId,
            this.userAdminActivityLogFactoryService.create(
                AdminAction.ACTIVATE_USER,
                this.userAdminCommandPolicyService.resolveTargetType(role),
                userId,
                user.nickname,
                '탈퇴 사용자 복구',
            ),
        );

        return this.userAdminDeletedUserCommandResponseService.toRestoreDeletedUserResponse(
            userId,
            role,
            previousStatus,
            updatedAt,
        );
    }
}
