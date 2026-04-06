import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthAdminSnapshot } from '../../application/ports/auth-admin-reader.port';
import {
    AuthAdminIssuedTokenPayload,
    AuthAdminVerifiedTokenPayload,
} from '../../application/ports/auth-admin-token.port';

@Injectable()
export class AuthAdminAuthenticationService {
    throwInvalidCredentials(): never {
        throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    throwInvalidToken(): never {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    assertAdminRole(payload: AuthAdminVerifiedTokenPayload): void {
        if (payload.role !== 'admin') {
            this.throwInvalidToken();
        }
    }

    toTokenPayload(admin: AuthAdminSnapshot): AuthAdminIssuedTokenPayload {
        return {
            sub: admin.adminId,
            email: admin.email,
            role: 'admin',
            adminLevel: admin.adminLevel,
        };
    }
}
