import { Injectable } from '@nestjs/common';

import { UserAdminAdminSnapshot } from '../../application/ports/user-admin-reader.port';
import type { UserAdminAdminProfileResult } from '../../application/types/user-admin-result.type';

@Injectable()
export class UserAdminAdminProfileMapperService {
    toResult(admin: UserAdminAdminSnapshot): UserAdminAdminProfileResult {
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
            lastLoginAt: admin.lastLoginAt,
        };
    }
}
