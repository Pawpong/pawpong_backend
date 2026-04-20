import { Injectable } from '@nestjs/common';

import { AuthAdopterRepository } from '../repository/auth-adopter.repository';
import { AuthBreederRepository } from '../repository/auth-breeder.repository';
import {
    type AuthProfileImageTargetPort,
    type AuthProfileImageOwnerRole,
} from '../application/ports/auth-profile-image-target.port';

@Injectable()
export class AuthProfileImageTargetAdapter implements AuthProfileImageTargetPort {
    constructor(
        private readonly authAdopterRepository: AuthAdopterRepository,
        private readonly authBreederRepository: AuthBreederRepository,
    ) {}

    async save(userId: string, role: AuthProfileImageOwnerRole, fileName: string): Promise<void> {
        if (role === 'breeder') {
            await this.authBreederRepository.updateProfileImage(userId, fileName);
            return;
        }

        await this.authAdopterRepository.updateProfileImage(userId, fileName);
    }
}
