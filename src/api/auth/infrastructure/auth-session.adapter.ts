import { Injectable } from '@nestjs/common';

import { AuthAdopterRepository } from '../repository/auth-adopter.repository';
import { AuthBreederRepository } from '../repository/auth-breeder.repository';
import { AuthSessionPort, type AuthSessionRole, type AuthSessionUser } from '../application/ports/auth-session.port';

@Injectable()
export class AuthSessionAdapter implements AuthSessionPort {
    constructor(
        private readonly authAdopterRepository: AuthAdopterRepository,
        private readonly authBreederRepository: AuthBreederRepository,
    ) {}

    async findById(userId: string, role: AuthSessionRole): Promise<AuthSessionUser | null> {
        if (role === 'adopter') {
            const adopter = await this.authAdopterRepository.findById(userId);
            if (!adopter) {
                return null;
            }

            return {
                id: (adopter._id as any).toString(),
                email: adopter.emailAddress,
                role,
                refreshTokenHash: adopter.refreshToken ?? null,
            };
        }

        const breeder = await this.authBreederRepository.findById(userId);
        if (!breeder) {
            return null;
        }

        return {
            id: (breeder._id as any).toString(),
            email: breeder.emailAddress,
            role,
            refreshTokenHash: breeder.refreshToken ?? null,
        };
    }

    async updateRefreshToken(userId: string, role: AuthSessionRole, refreshTokenHash: string | null): Promise<void> {
        if (role === 'adopter') {
            await this.authAdopterRepository.updateRefreshToken(userId, refreshTokenHash);
            return;
        }

        await this.authBreederRepository.updateRefreshToken(userId, refreshTokenHash);
    }
}
