import { Inject, Injectable } from '@nestjs/common';

import { AUTH_SESSION_PORT, type AuthSessionPort, type AuthSessionRole } from '../ports/auth-session.port';
import { type LogoutResult } from '../types/auth-response.type';
import { buildAuthLogoutResult } from '../../constants/auth-response-messages';

@Injectable()
export class LogoutUseCase {
    constructor(
        @Inject(AUTH_SESSION_PORT)
        private readonly authSessionPort: AuthSessionPort,
    ) {}

    async execute(userId: string, role: string): Promise<LogoutResult> {
        if (role === 'adopter' || role === 'breeder') {
            await this.authSessionPort.updateRefreshToken(userId, role as AuthSessionRole, null);
        }

        return buildAuthLogoutResult(new Date().toISOString());
    }
}
