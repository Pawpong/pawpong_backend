import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { TermsItemMapperService } from '../../../../service/terms/domain/services/terms-item-mapper.service';
import { TERMS_WRITER_PORT, type TermsWriterPort } from '../ports/terms-writer.port';
import type { TermsUpdateCommand } from '../types/terms-command.type';
import type { TermsItemResult } from '../../../../service/terms/application/types/terms-result.type';

@Injectable()
export class UpdateTermsUseCase {
    constructor(
        @Inject(TERMS_WRITER_PORT)
        private readonly termsWriter: TermsWriterPort,
        private readonly termsItemMapperService: TermsItemMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(termsId: string, adminId: string, updateData: TermsUpdateCommand): Promise<TermsItemResult> {
        this.logger.logStart('updateTerms', '약관 수정 시작', { termsId, adminId });

        if (!termsId) {
            throw new DomainValidationError('약관 ID가 필요합니다.');
        }

        if (!adminId) {
            throw new DomainValidationError('관리자 정보가 올바르지 않습니다.');
        }

        try {
            const terms = await this.termsWriter.update(termsId, updateData);

            if (!terms) {
                throw new DomainNotFoundError('해당 약관을 찾을 수 없습니다.');
            }

            this.logger.logSuccess('updateTerms', '약관 수정 완료', { termsId });
            return this.termsItemMapperService.toItem(terms);
        } catch (error) {
            this.logger.logError('updateTerms', '약관 수정', error);
            throw error;
        }
    }
}
