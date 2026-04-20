import { Injectable } from '@nestjs/common';

import type { AuthResult } from '../../application/types/auth-response.type';
import type { AuthTokenSet } from '../../application/types/auth-token-set.type';
import type { AuthRegistrationRecord } from '../../types/auth-record.type';

@Injectable()
export class AuthSocialRegistrationResultMapperService {
    toResult(
        savedUser: AuthRegistrationRecord,
        tokens: AuthTokenSet,
        role: 'adopter' | 'breeder',
        message: string,
    ): AuthResult {
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            accessTokenExpiresIn: tokens.accessTokenExpiresIn,
            refreshTokenExpiresIn: tokens.refreshTokenExpiresIn,
            userInfo: {
                userId: savedUser._id.toString(),
                emailAddress: savedUser.emailAddress,
                nickname: role === 'adopter' ? savedUser.nickname || '' : savedUser.name || savedUser.nickname || '',
                userRole: role,
                accountStatus: savedUser.accountStatus,
                profileImageFileName: savedUser.profileImageFileName ?? undefined,
            },
            message,
        };
    }
}
