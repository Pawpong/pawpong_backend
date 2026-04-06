import { Injectable } from '@nestjs/common';

import { AuthBreederRepository } from '../repository/auth-breeder.repository';
import {
    AuthBreederVerificationCommandPort,
    AuthBreederVerificationDocumentRecord,
} from '../application/ports/auth-breeder-verification-command.port';

@Injectable()
export class AuthBreederVerificationCommandAdapter extends AuthBreederVerificationCommandPort {
    constructor(private readonly authBreederRepository: AuthBreederRepository) {
        super();
    }

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
