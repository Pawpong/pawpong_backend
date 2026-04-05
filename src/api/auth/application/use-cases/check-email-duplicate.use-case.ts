import { Inject, Injectable } from '@nestjs/common';

import { AuthRegistrationPort } from '../ports/auth-registration.port';

@Injectable()
export class CheckEmailDuplicateUseCase {
    constructor(
        @Inject(AuthRegistrationPort)
        private readonly authRegistrationPort: AuthRegistrationPort,
    ) {}

    async execute(email: string): Promise<boolean> {
        const adopter = await this.authRegistrationPort.findAdopterByEmail(email);
        if (adopter) {
            return true;
        }

        const breeder = await this.authRegistrationPort.findBreederByEmail(email);
        return !!breeder;
    }
}
