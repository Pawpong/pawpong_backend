import { Injectable } from '@nestjs/common';

import type {
    ProfileUpdatableRole,
    ProfileWriterPort,
    UpdateMyProfileCommand,
} from '../application/ports/profile-writer.port';
import { ProfileRepository } from '../repository/profile.repository';

@Injectable()
export class ProfileWriterMongooseAdapter implements ProfileWriterPort {
    constructor(private readonly repository: ProfileRepository) {}

    async updateMyProfile(
        userId: string,
        role: ProfileUpdatableRole,
        command: UpdateMyProfileCommand,
    ): Promise<boolean> {
        if (role === 'adopter') {
            return this.repository.updateAdopterProfile(userId, command);
        }
        return this.repository.updateBreederProfile(userId, command);
    }
}
