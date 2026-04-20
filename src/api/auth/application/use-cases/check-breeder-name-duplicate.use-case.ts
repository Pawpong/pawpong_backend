import { Inject, Injectable } from '@nestjs/common';

import { AUTH_REGISTRATION_PORT, type AuthRegistrationPort } from '../ports/auth-registration.port';

@Injectable()
export class CheckBreederNameDuplicateUseCase {
    constructor(
        @Inject(AUTH_REGISTRATION_PORT)
        private readonly authRegistrationPort: AuthRegistrationPort,
    ) {}

    async execute(breederName: string): Promise<boolean> {
        const breeder = await this.authRegistrationPort.findBreederByName(breederName);
        return !!breeder;
    }
}
