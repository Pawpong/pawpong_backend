import { Inject, Injectable } from '@nestjs/common';

import { AuthMapper } from '../../mapper/auth.mapper';
import { AUTH_REGISTRATION_PORT, type AuthRegistrationPort } from '../ports/auth-registration.port';
import { type SocialCheckUserResult } from '../types/auth-response.type';

@Injectable()
export class CheckSocialUserUseCase {
    constructor(
        @Inject(AUTH_REGISTRATION_PORT)
        private readonly authRegistrationPort: AuthRegistrationPort,
    ) {}

    async execute(provider: string, providerId: string, email?: string): Promise<SocialCheckUserResult> {
        void email;

        const adopter = await this.authRegistrationPort.findAdopterBySocialAuth(provider, providerId);
        if (adopter) {
            return AuthMapper.toSocialUserCheckResponseAdopter(adopter);
        }

        const breeder = await this.authRegistrationPort.findBreederBySocialAuth(provider, providerId);
        if (breeder) {
            return AuthMapper.toSocialUserCheckResponseBreeder(breeder);
        }

        return AuthMapper.toSocialUserCheckResponseNotFound();
    }
}
