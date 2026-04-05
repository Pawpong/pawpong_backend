import { Inject, Injectable } from '@nestjs/common';

import { AuthRegistrationPort } from '../ports/auth-registration.port';

@Injectable()
export class CheckNicknameDuplicateUseCase {
    constructor(
        @Inject(AuthRegistrationPort)
        private readonly authRegistrationPort: AuthRegistrationPort,
    ) {}

    async execute(nickname: string): Promise<boolean> {
        const adopter = await this.authRegistrationPort.findAdopterByNickname(nickname);
        return !!adopter;
    }
}
