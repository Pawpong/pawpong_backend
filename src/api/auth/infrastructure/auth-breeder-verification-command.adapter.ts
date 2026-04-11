import { Injectable } from '@nestjs/common';

import { AuthBreederRepository } from '../repository/auth-breeder.repository';
import {
    type AuthBreederVerificationCommandPort,
    type AuthBreederVerificationDocumentRecord,
} from '../application/ports/auth-breeder-verification-command.port';

@Injectable()
export class AuthBreederVerificationCommandAdapter implements AuthBreederVerificationCommandPort {
    constructor(private readonly authBreederRepository: AuthBreederRepository) {}

    findBreederById(userId: string) {
        return this.authBreederRepository.findById(userId);
    }

    async updateVerificationDocuments(
        userId: string,
        documents: AuthBreederVerificationDocumentRecord[],
        level: string,
        status: string,
        submittedAt: Date,
    ): Promise<void> {
        await this.authBreederRepository.updateVerificationDocuments(userId, documents, level, status, submittedAt);
    }
}
