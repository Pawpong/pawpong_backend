import { Inject, Injectable } from '@nestjs/common';

import { AuthMapper } from '../../mapper/auth.mapper';
import { AuthRegistrationPort } from '../ports/auth-registration.port';
import { SocialCheckUserResponseDto } from '../../dto/response/social-check-user-response.dto';

@Injectable()
export class CheckSocialUserUseCase {
    constructor(
        @Inject(AuthRegistrationPort)
        private readonly authRegistrationPort: AuthRegistrationPort,
    ) {}

    async execute(provider: string, providerId: string, email?: string): Promise<SocialCheckUserResponseDto> {
        void email;

        const adopter = await this.authRegistrationPort.findAdopterBySocialAuth(provider, providerId);
        if (adopter) {
            return AuthMapper.toSocialUserCheckResponseAdopter(adopter);
        }

        const breeder = await this.authRegistrationPort.findBreederBySocialAuth(provider, providerId);
        if (breeder) {
            return AuthMapper.toSocialUserCheckResponseBreeder(breeder);
        }

        return AuthMapper.toSocialUserCheckResponseNotFound() as SocialCheckUserResponseDto;
    }
}
