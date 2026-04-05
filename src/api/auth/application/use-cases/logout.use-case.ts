import { Inject, Injectable } from '@nestjs/common';

import { AuthSessionPort, type AuthSessionRole } from '../ports/auth-session.port';
import { LogoutResponseDto } from '../../dto/response/logout-response.dto';

@Injectable()
export class LogoutUseCase {
    constructor(
        @Inject(AuthSessionPort)
        private readonly authSessionPort: AuthSessionPort,
    ) {}

    async execute(userId: string, role: string): Promise<LogoutResponseDto> {
        if (role === 'adopter' || role === 'breeder') {
            await this.authSessionPort.updateRefreshToken(userId, role as AuthSessionRole, null);
        }

        return {
            success: true,
            loggedOutAt: new Date().toISOString(),
            message: '로그아웃되었습니다.',
        };
    }
}
