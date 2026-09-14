import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { TermsItemMapperService } from '../../../../service/terms/domain/services/terms-item-mapper.service';
import { TERMS_WRITER_PORT, type TermsWriterPort } from '../ports/terms-writer.port';
import type { TermsItemResult } from '../../../../service/terms/application/types/terms-result.type';

@Injectable()
export class GetTermsDetailAdminUseCase {
    constructor(
        @Inject(TERMS_WRITER_PORT)
        private readonly termsWriter: TermsWriterPort,
        private readonly termsItemMapperService: TermsItemMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(termsId: string): Promise<TermsItemResult> {
        this.logger.logStart('getTermsDetailAdmin', '약관 상세 조회 시작', { termsId });

        if (!termsId) {
            throw new DomainValidationError('약관 ID가 필요합니다.');
        }

        try {
            const terms = await this.termsWriter.findById(termsId);

            if (!terms) {
                throw new DomainNotFoundError('해당 약관을 찾을 수 없습니다.');
            }

            this.logger.logSuccess('getTermsDetailAdmin', '약관 상세 조회 완료', { termsId });
            return this.termsItemMapperService.toItem(terms);
        } catch (error) {
            this.logger.logError('getTermsDetailAdmin', '약관 상세 조회', error);
            throw error;
        }
    }
}
