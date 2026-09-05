import { Injectable } from '@nestjs/common';

import { AuthAdopterRepository } from '../repository/auth-adopter.repository';
import { AuthBreederRepository } from '../repository/auth-breeder.repository';
import { AuthRegistrationPort } from '../application/ports/auth-registration.port';
import type { AuthRegistrationRecord } from '../types/auth-record.type';

@Injectable()
export class AuthRegistrationAdapter implements AuthRegistrationPort {
    constructor(
        private readonly authAdopterRepository: AuthAdopterRepository,
        private readonly authBreederRepository: AuthBreederRepository,
    ) {}

    findAdopterByEmail(email: string): Promise<AuthRegistrationRecord | null> {
        return this.authAdopterRepository.findByEmail(email);
    }

    findAdopterByNickname(nickname: string): Promise<AuthRegistrationRecord | null> {
        return this.authAdopterRepository.findByNickname(nickname);
    }

    findAdopterBySocialAuth(provider: string, providerId: string): Promise<AuthRegistrationRecord | null> {
        return this.authAdopterRepository.findBySocialAuth(provider, providerId);
    }

    createAdopter(adopterData: Record<string, unknown>): Promise<AuthRegistrationRecord> {
        return this.authAdopterRepository.create(adopterData);
    }

    async saveAdopterRefreshToken(userId: string, refreshTokenHash: string): Promise<void> {
        await this.authAdopterRepository.update(userId, {
            refreshToken: refreshTokenHash,
            lastActivityAt: new Date(),
        });
    }

    findBreederByEmail(email: string): Promise<AuthRegistrationRecord | null> {
        return this.authBreederRepository.findByEmail(email);
    }

    findBreederByName(breederName: string): Promise<AuthRegistrationRecord | null> {
        return this.authBreederRepository.findByBreederName(breederName);
    }

    findBreederBySocialAuth(provider: string, providerId: string): Promise<AuthRegistrationRecord | null> {
        return this.authBreederRepository.findBySocialAuth(provider, providerId);
    }

    createBreeder(breederData: Record<string, unknown>): Promise<AuthRegistrationRecord> {
        return this.authBreederRepository.create(breederData);
    }

    async saveBreederRefreshToken(userId: string, refreshTokenHash: string): Promise<void> {
        await this.authBreederRepository.updateRefreshToken(userId, refreshTokenHash);
    }
}
