import { Inject, Injectable } from '@nestjs/common';

import { AdminAction } from '../../../../../common/enum/user.enum';
import { USER_ADMIN_READER_PORT, type UserAdminManagedUserRole, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { USER_ADMIN_WRITER_PORT, type UserAdminWriterPort } from '../ports/user-admin-writer.port';
import { UserAdminActivityLogFactoryService } from '../../domain/services/user-admin-activity-log-factory.service';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import { UserAdminDeletedUserCommandResultMapperService } from '../../domain/services/user-admin-deleted-user-command-result-mapper.service';
import type { UserAdminHardDeleteResult } from '../types/user-admin-result.type';

@Injectable()
export class HardDeleteUserUseCase {
    constructor(
        @Inject(USER_ADMIN_READER_PORT)
        private readonly userAdminReader: UserAdminReaderPort,
        @Inject(USER_ADMIN_WRITER_PORT)
        private readonly userAdminWriter: UserAdminWriterPort,
        private readonly userAdminCommandPolicyService: UserAdminCommandPolicyService,
        private readonly userAdminActivityLogFactoryService: UserAdminActivityLogFactoryService,
        private readonly userAdminDeletedUserCommandResultMapperService: UserAdminDeletedUserCommandResultMapperService,
    ) {}

    async execute(adminId: string, userId: string, role: UserAdminManagedUserRole): Promise<UserAdminHardDeleteResult> {
        this.userAdminCommandPolicyService.assertSuperAdmin(await this.userAdminReader.findAdminById(adminId));

        const user = this.userAdminCommandPolicyService.assertManagedUserExists(
            role,
            await this.userAdminReader.findManagedUserById(role, userId),
        );

        this.userAdminCommandPolicyService.assertHardDeleteAllowed(user);

        const userName = this.userAdminCommandPolicyService.getManagedUserDisplayName(role, user);
        const userEmail = user.emailAddress || '';

        await this.userAdminWriter.appendAdminActivityLog(
            adminId,
            this.userAdminActivityLogFactoryService.create(
                AdminAction.DELETE_USER,
                this.userAdminCommandPolicyService.resolveTargetType(role),
                userId,
                userName,
                `영구 삭제 (이메일: ${userEmail})`,
            ),
        );

        await this.userAdminWriter.deleteManagedUser(role, userId);

        return this.userAdminDeletedUserCommandResultMapperService.toHardDeleteUserResult(userId, role, userName, userEmail);
    }
}
