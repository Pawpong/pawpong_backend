import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { TERMS_WRITER_PORT, type TermsWriterPort } from '../ports/terms-writer.port';

@Injectable()
export class DeleteTermsUseCase {
    constructor(
        @Inject(TERMS_WRITER_PORT)
        private readonly termsWriter: TermsWriterPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(termsId: string, adminId: string): Promise<void> {
        this.logger.logStart('deleteTerms', '약관 삭제 시작', { termsId, adminId });

        if (!termsId) {
            throw new DomainValidationError('약관 ID가 필요합니다.');
        }

        if (!adminId) {
            throw new DomainValidationError('관리자 정보가 올바르지 않습니다.');
        }

        try {
            const deleted = await this.termsWriter.delete(termsId);

            if (!deleted) {
                throw new DomainNotFoundError('해당 약관을 찾을 수 없습니다.');
            }

            this.logger.logSuccess('deleteTerms', '약관 삭제 완료', { termsId });
        } catch (error) {
            this.logger.logError('deleteTerms', '약관 삭제', error);
            throw error;
        }
    }
}
