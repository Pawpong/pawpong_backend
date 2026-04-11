import { Inject, Injectable } from '@nestjs/common';

import { AUTH_REGISTRATION_PORT, type AuthRegistrationPort } from '../ports/auth-registration.port';

@Injectable()
export class CheckNicknameDuplicateUseCase {
    constructor(
        @Inject(AUTH_REGISTRATION_PORT)
        private readonly authRegistrationPort: AuthRegistrationPort,
    ) {}

    async execute(nickname: string): Promise<boolean> {
        const adopter = await this.authRegistrationPort.findAdopterByNickname(nickname);
        return !!adopter;
    }
}
