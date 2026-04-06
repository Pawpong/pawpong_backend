import { Inject, Injectable } from '@nestjs/common';

import { UserStatus } from '../../../../../common/enum/user.enum';
import { UserManagementRequestDto } from '../../dto/request/user-management-request.dto';
import { USER_ADMIN_READER, type UserAdminManagedUserRole, type UserAdminReaderPort } from '../ports/user-admin-reader.port';
import { USER_ADMIN_WRITER, type UserAdminWriterPort } from '../ports/user-admin-writer.port';
import { UserAdminActivityLogFactoryService } from '../../domain/services/user-admin-activity-log-factory.service';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';

@Injectable()
export class UpdateUserStatusUseCase {
    constructor(
        @Inject(USER_ADMIN_READER)
        private readonly userAdminReader: UserAdminReaderPort,
        @Inject(USER_ADMIN_WRITER)
        private readonly userAdminWriter: UserAdminWriterPort,
        private readonly userAdminCommandPolicyService: UserAdminCommandPolicyService,
        private readonly userAdminActivityLogFactoryService: UserAdminActivityLogFactoryService,
    ) {}

    async execute(
        adminId: string,
        userId: string,
        role: UserAdminManagedUserRole,
        userData: UserManagementRequestDto,
    ): Promise<{ message: string }> {
        this.userAdminCommandPolicyService.assertCanManageUsers(
            await this.userAdminReader.findAdminById(adminId),
            'Access denied',
        );

        const user = this.userAdminCommandPolicyService.assertManagedUserExists(
            role,
            await this.userAdminReader.findManagedUserById(role, userId),
        );

        await this.userAdminWriter.updateManagedUser(role, userId, {
            accountStatus: userData.accountStatus,
            ...(userData.accountStatus === UserStatus.DELETED ? { deletedAt: new Date() } : { deletedAt: undefined }),
            ...(userData.accountStatus === UserStatus.SUSPENDED
                ? {
                      suspensionReason: userData.actionReason,
                      suspendedAt: new Date(),
                  }
                : {}),
        });

        await this.userAdminWriter.appendAdminActivityLog(
            adminId,
            this.userAdminActivityLogFactoryService.create(
                this.userAdminCommandPolicyService.resolveAdminAction(userData.accountStatus),
                this.userAdminCommandPolicyService.resolveTargetType(role),
                userId,
                user.fullName || user.name,
                userData.actionReason || `User status changed to ${userData.accountStatus}`,
            ),
        );

        return { message: `${role} status updated to ${userData.accountStatus}` };
    }
}
