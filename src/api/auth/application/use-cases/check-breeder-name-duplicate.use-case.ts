import { Inject, Injectable } from '@nestjs/common';

import { AuthRegistrationPort } from '../ports/auth-registration.port';

@Injectable()
export class CheckBreederNameDuplicateUseCase {
    constructor(
        @Inject(AuthRegistrationPort)
        private readonly authRegistrationPort: AuthRegistrationPort,
    ) {}

    async execute(breederName: string): Promise<boolean> {
        const breeder = await this.authRegistrationPort.findBreederByName(breederName);
        return !!breeder;
    }
}
