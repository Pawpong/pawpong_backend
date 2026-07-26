import { Injectable } from '@nestjs/common';

import type { AdminRefreshTokenResult } from '../../application/types/auth-admin-result.type';

@Injectable()
export class AuthAdminRefreshTokenResultMapperService {
    toResult(accessToken: string): AdminRefreshTokenResult {
        return { accessToken };
    }
}
