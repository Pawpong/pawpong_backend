import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { VerificationStatus } from '../../../../common/enum/user.enum';
import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import {
    AuthBreederDocumentSubmissionResponse,
    AuthBreederDocumentUrls,
} from '../ports/auth-breeder-document-submission.port';
import {
    AUTH_BREEDER_VERIFICATION_COMMAND_PORT,
    type AuthBreederVerificationCommandPort,
} from '../ports/auth-breeder-verification-command.port';
import { AuthBreederDocumentSubmissionService } from '../../domain/services/auth-breeder-document-submission.service';

@Injectable()
export class SubmitAuthBreederDocumentsUseCase {
    constructor(
        @Inject(AUTH_BREEDER_VERIFICATION_COMMAND_PORT)
        private readonly authBreederVerificationCommandPort: AuthBreederVerificationCommandPort,
        private readonly authBreederDocumentSubmissionService: AuthBreederDocumentSubmissionService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(
        userId: string,
        breederLevel: 'elite' | 'new',
        documents: AuthBreederDocumentUrls,
    ): Promise<AuthBreederDocumentSubmissionResponse> {
        this.logger.logStart('submitBreederDocuments', '브리더 서류 제출 시작', {
            userId,
            breederLevel,
        });

        this.authBreederDocumentSubmissionService.assertRequiredDocumentUrls(documents);

        const breeder = await this.authBreederVerificationCommandPort.findBreederById(userId);
        if (!breeder) {
            this.logger.logError('submitBreederDocuments', '브리더를 찾을 수 없음', new Error('Breeder not found'));
            throw new DomainNotFoundError('브리더를 찾을 수 없습니다.');
        }

        const storedDocuments = this.authBreederDocumentSubmissionService.createStoredDocuments(
            breederLevel,
            documents,
        );
        const submittedAt = new Date();

        await this.authBreederVerificationCommandPort.updateVerificationDocuments(
            userId,
            storedDocuments,
            breederLevel,
            VerificationStatus.REVIEWING,
            submittedAt,
        );

        this.logger.logSuccess('submitBreederDocuments', '브리더 서류 제출 완료', {
            breederId: breeder._id,
            level: breederLevel,
            documentsCount: storedDocuments.length,
        });

        return this.authBreederDocumentSubmissionService.createResponse(
            breeder._id.toString(),
            this.authBreederDocumentSubmissionService.createUploadedDocuments(breederLevel, documents),
            submittedAt,
        );
    }
}
