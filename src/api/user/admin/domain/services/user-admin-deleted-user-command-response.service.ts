import { Injectable } from '@nestjs/common';

import { UserAdminManagedUserRole } from '../../application/ports/user-admin-reader.port';

@Injectable()
export class UserAdminDeletedUserCommandResponseService {
    toRestoreDeletedUserResponse(
        userId: string,
        role: UserAdminManagedUserRole,
        previousStatus: string,
        updatedAt: Date,
    ) {
        return {
            userId,
            role,
            previousStatus,
            newStatus: 'active',
            updatedAt: updatedAt.toISOString(),
            message: `${role === 'adopter' ? '입양자' : '브리더'} 계정이 복구되었습니다.`,
        };
    }

    toHardDeleteUserResponse(
        userId: string,
        role: UserAdminManagedUserRole,
        userName: string,
        userEmail: string,
    ) {
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
