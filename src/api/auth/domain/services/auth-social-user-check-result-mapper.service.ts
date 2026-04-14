import { Injectable } from '@nestjs/common';

import type { SocialCheckUserResult } from '../../application/types/auth-response.type';
import type { AuthRegistrationRecord } from '../../types/auth-record.type';

@Injectable()
export class AuthSocialUserCheckResultMapperService {
    toAdopterResult(adopter: AuthRegistrationRecord): SocialCheckUserResult {
        return {
            exists: true,
            userRole: 'adopter',
            userId: adopter._id.toString(),
            email: adopter.emailAddress,
            nickname: adopter.nickname || '',
            profileImageFileName: adopter.profileImageFileName ?? undefined,
        };
    }

    toBreederResult(breeder: AuthRegistrationRecord): SocialCheckUserResult {
        return {
            exists: true,
            userRole: 'breeder',
            userId: breeder._id.toString(),
            email: breeder.emailAddress,
            nickname: breeder.name || breeder.nickname || '',
            profileImageFileName: breeder.profileImageFileName ?? undefined,
        };
    }

    toNotFoundResult(): SocialCheckUserResult {
        return {
            exists: false,
        };
    }
}
