import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ACCOUNT_ACCESS_REVOKED } from '../../../../../common/account-access/account-access-revoked.event';

import { UserStatus } from '../../../../../common/enum/user.enum';
import {
    USER_ADMIN_READER_PORT,
    type UserAdminManagedUserRole,
    type UserAdminReaderPort,
} from '../ports/user-admin-reader.port';
import { USER_ADMIN_WRITER_PORT, type UserAdminWriterPort } from '../ports/user-admin-writer.port';
import { UserAdminActivityLogFactoryService } from '../../domain/services/user-admin-activity-log-factory.service';
import { UserAdminCommandPolicyService } from '../../domain/services/user-admin-command-policy.service';
import type { UserAdminStatusUpdateCommand } from '../types/user-admin-command.type';

@Injectable()
export class UpdateUserStatusUseCase {
    constructor(
        @Inject(USER_ADMIN_READER_PORT)
        private readonly userAdminReader: UserAdminReaderPort,
        @Inject(USER_ADMIN_WRITER_PORT)
        private readonly userAdminWriter: UserAdminWriterPort,
        private readonly userAdminCommandPolicyService: UserAdminCommandPolicyService,
        private readonly userAdminActivityLogFactoryService: UserAdminActivityLogFactoryService,
        private readonly events: EventEmitter2,
    ) {}

    async execute(
        adminId: string,
        userId: string,
        role: UserAdminManagedUserRole,
        userData: UserAdminStatusUpdateCommand,
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

        if (userData.accountStatus === UserStatus.DELETED || userData.accountStatus === UserStatus.SUSPENDED) {
            await this.events.emitAsync(ACCOUNT_ACCESS_REVOKED, { userId, role });
        }

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
