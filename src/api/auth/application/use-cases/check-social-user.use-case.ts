import { Inject, Injectable } from '@nestjs/common';

import { AUTH_REGISTRATION_PORT, type AuthRegistrationPort } from '../ports/auth-registration.port';
import { type SocialCheckUserResult } from '../types/auth-response.type';
import { AuthSocialUserCheckResultMapperService } from '../../domain/services/auth-social-user-check-result-mapper.service';

@Injectable()
export class CheckSocialUserUseCase {
    constructor(
        @Inject(AUTH_REGISTRATION_PORT)
        private readonly authRegistrationPort: AuthRegistrationPort,
        private readonly authSocialUserCheckResultMapperService: AuthSocialUserCheckResultMapperService,
    ) {}

    async execute(provider: string, providerId: string, email?: string): Promise<SocialCheckUserResult> {
        void email;

        const adopter = await this.authRegistrationPort.findAdopterBySocialAuth(provider, providerId);
        if (adopter) {
            return this.authSocialUserCheckResultMapperService.toAdopterResult(adopter);
        }

        const breeder = await this.authRegistrationPort.findBreederBySocialAuth(provider, providerId);
        if (breeder) {
            return this.authSocialUserCheckResultMapperService.toBreederResult(breeder);
        }

        return this.authSocialUserCheckResultMapperService.toNotFoundResult();
    }
}
