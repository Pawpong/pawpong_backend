import { Injectable } from '@nestjs/common';

import { AuthAdopterRepository } from '../repository/auth-adopter.repository';
import { AuthBreederRepository } from '../repository/auth-breeder.repository';
import { type AuthRegistrationPort, type AuthRegistrationRecord } from '../application/ports/auth-registration.port';

@Injectable()
export class AuthRegistrationAdapter implements AuthRegistrationPort {
    constructor(
        private readonly authAdopterRepository: AuthAdopterRepository,
        private readonly authBreederRepository: AuthBreederRepository,
    ) {}

    findAdopterByEmail(email: string): Promise<AuthRegistrationRecord | null> {
        return this.authAdopterRepository.findByEmail(email) as Promise<AuthRegistrationRecord | null>;
    }

    findAdopterByNickname(nickname: string): Promise<AuthRegistrationRecord | null> {
        return this.authAdopterRepository.findByNickname(nickname) as Promise<AuthRegistrationRecord | null>;
    }

    findAdopterBySocialAuth(provider: string, providerId: string): Promise<AuthRegistrationRecord | null> {
        return this.authAdopterRepository.findBySocialAuth(provider, providerId) as Promise<AuthRegistrationRecord | null>;
    }

    createAdopter(adopterData: Record<string, any>): Promise<AuthRegistrationRecord> {
        return this.authAdopterRepository.create(adopterData) as Promise<AuthRegistrationRecord>;
    }

    async saveAdopterRefreshToken(userId: string, refreshTokenHash: string): Promise<void> {
        await this.authAdopterRepository.update(userId, {
            refreshToken: refreshTokenHash,
            lastActivityAt: new Date(),
        });
    }

    findBreederByEmail(email: string): Promise<AuthRegistrationRecord | null> {
        return this.authBreederRepository.findByEmail(email) as Promise<AuthRegistrationRecord | null>;
    }

    findBreederByName(breederName: string): Promise<AuthRegistrationRecord | null> {
        return this.authBreederRepository.findByBreederName(breederName) as Promise<AuthRegistrationRecord | null>;
    }

    findBreederBySocialAuth(provider: string, providerId: string): Promise<AuthRegistrationRecord | null> {
        return this.authBreederRepository.findBySocialAuth(provider, providerId) as Promise<AuthRegistrationRecord | null>;
    }

    createBreeder(breederData: Record<string, any>): Promise<AuthRegistrationRecord> {
        return this.authBreederRepository.create(breederData) as Promise<AuthRegistrationRecord>;
    }

    async saveBreederRefreshToken(userId: string, refreshTokenHash: string): Promise<void> {
        await this.authBreederRepository.updateRefreshToken(userId, refreshTokenHash);
    }
}
