import { Injectable } from '@nestjs/common';

import { DomainAuthenticationError } from '../../../../common/error/domain.error';
import type { AuthSessionRole, AuthSessionUser } from '../../application/ports/auth-session.port';

@Injectable()
export class AuthSessionAuthenticationService {
    assertRefreshableRole(role: string): asserts role is AuthSessionRole {
        if (role !== 'adopter' && role !== 'breeder') {
            throw new DomainAuthenticationError('유효하지 않은 사용자 역할입니다.');
        }
    }

    assertUser(user: AuthSessionUser | null): asserts user is AuthSessionUser {
        if (!user) {
            throw new DomainAuthenticationError('사용자를 찾을 수 없습니다.');
        }
    }

    assertRefreshTokenHash(refreshTokenHash: string | null): asserts refreshTokenHash is string {
        if (!refreshTokenHash) {
            throw new DomainAuthenticationError('리프레시 토큰이 존재하지 않습니다.');
        }
    }

    assertRefreshTokenValid(isTokenValid: boolean): void {
        if (!isTokenValid) {
            throw new DomainAuthenticationError('유효하지 않은 리프레시 토큰입니다.');
        }
    }

    throwExpiredRefreshToken(): never {
        throw new DomainAuthenticationError('리프레시 토큰이 만료되었습니다.');
    }

    throwMalformedRefreshToken(): never {
        throw new DomainAuthenticationError('유효하지 않은 토큰 형식입니다.');
    }
}
