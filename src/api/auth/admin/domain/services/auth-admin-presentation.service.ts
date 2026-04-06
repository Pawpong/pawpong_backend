import { Injectable } from '@nestjs/common';

import { AdminLoginResponseDto } from '../../../dto/response/admin-login-response.dto';
import { AuthAdminSnapshot } from '../../application/ports/auth-admin-reader.port';

@Injectable()
export class AuthAdminPresentationService {
    toLoginResponse(
        admin: AuthAdminSnapshot,
        tokens: {
            accessToken: string;
            refreshToken: string;
        },
    ): AdminLoginResponseDto {
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

    toRefreshResponse(accessToken: string): { accessToken: string } {
        return { accessToken };
    }
}
