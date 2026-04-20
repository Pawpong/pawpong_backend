import { Injectable } from '@nestjs/common';

import { DomainAuthenticationError } from '../../../../../common/error/domain.error';
import { AuthAdminSnapshot } from '../../application/ports/auth-admin-reader.port';
import {
    AuthAdminIssuedTokenPayload,
    AuthAdminVerifiedTokenPayload,
} from '../../application/ports/auth-admin-token.port';

@Injectable()
export class AuthAdminAuthenticationService {
    throwInvalidCredentials(): never {
        throw new DomainAuthenticationError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    throwInvalidToken(): never {
        throw new DomainAuthenticationError('유효하지 않은 토큰입니다.');
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
