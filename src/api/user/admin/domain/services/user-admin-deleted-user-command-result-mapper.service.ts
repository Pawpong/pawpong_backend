import { Injectable } from '@nestjs/common';

import { UserAdminManagedUserRole } from '../../application/ports/user-admin-reader.port';
import type { UserAdminHardDeleteResult, UserAdminStatusUpdateResult } from '../../application/types/user-admin-result.type';

@Injectable()
export class UserAdminDeletedUserCommandResultMapperService {
    toRestoreDeletedUserResult(
        userId: string,
        role: UserAdminManagedUserRole,
        previousStatus: string,
        updatedAt: Date,
    ): UserAdminStatusUpdateResult {
        return {
            userId,
            role,
            previousStatus,
            newStatus: 'active',
            updatedAt: updatedAt.toISOString(),
            message: `${role === 'adopter' ? '입양자' : '브리더'} 계정이 복구되었습니다.`,
        };
    }

    toHardDeleteUserResult(
        userId: string,
        role: UserAdminManagedUserRole,
        userName: string,
        userEmail: string,
    ): UserAdminHardDeleteResult {
        return {
            userId,
            role,
            userName,
            userEmail,
            deletedAt: new Date().toISOString(),
            message: `${role === 'adopter' ? '입양자' : '브리더'} 데이터가 영구적으로 삭제되었습니다.`,
        };
    }
}
