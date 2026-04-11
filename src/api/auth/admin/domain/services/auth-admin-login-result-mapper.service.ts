import { Injectable } from '@nestjs/common';

import { AuthAdminSnapshot } from '../../application/ports/auth-admin-reader.port';
import type { AdminLoginResult } from '../../application/types/auth-admin-result.type';

@Injectable()
export class AuthAdminLoginResultMapperService {
    toResult(
        admin: AuthAdminSnapshot,
        tokens: {
            accessToken: string;
            refreshToken: string;
        },
    ): AdminLoginResult {
        return {
            adminId: admin.adminId,
            email: admin.email,
            name: admin.name,
            adminLevel: admin.adminLevel,
            permissions: admin.permissions,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
}
