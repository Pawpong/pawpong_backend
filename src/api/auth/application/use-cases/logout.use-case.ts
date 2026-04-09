import { Inject, Injectable } from '@nestjs/common';

import { AuthSessionPort, type AuthSessionRole } from '../ports/auth-session.port';
import { LogoutResponseDto } from '../../dto/response/logout-response.dto';
import { AuthLogoutResponseFactoryService } from '../../domain/services/auth-logout-response-factory.service';

@Injectable()
export class LogoutUseCase {
    constructor(
        @Inject(AuthSessionPort)
        private readonly authSessionPort: AuthSessionPort,
        private readonly authLogoutResponseFactoryService: AuthLogoutResponseFactoryService,
    ) {}

    async execute(userId: string, role: string): Promise<LogoutResponseDto> {
        if (role === 'adopter' || role === 'breeder') {
            await this.authSessionPort.updateRefreshToken(userId, role as AuthSessionRole, null);
        }

        return this.authLogoutResponseFactoryService.createLoggedOut(new Date().toISOString());
    }
}
