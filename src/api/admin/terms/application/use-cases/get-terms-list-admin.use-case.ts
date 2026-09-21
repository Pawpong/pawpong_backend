import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { TermsItemMapperService } from '../../../../service/terms/domain/services/terms-item-mapper.service';
import { TERMS_WRITER_PORT, type TermsWriterPort } from '../ports/terms-writer.port';
import type { TermsItemResult } from '../../../../service/terms/application/types/terms-result.type';

/** 관리자용 약관 전체 목록 — 비활성(과거/초안) 버전도 함께 보여준다 */
@Injectable()
export class GetTermsListAdminUseCase {
    constructor(
        @Inject(TERMS_WRITER_PORT)
        private readonly termsWriter: TermsWriterPort,
        private readonly termsItemMapperService: TermsItemMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(): Promise<TermsItemResult[]> {
        this.logger.logStart('getTermsListAdmin', '약관 전체 목록 조회 시작');

        try {
            const items = await this.termsWriter.findAll();
            const result = items.map((item) => this.termsItemMapperService.toItem(item));

            this.logger.logSuccess('getTermsListAdmin', '약관 전체 목록 조회 완료', { count: result.length });
            return result;
        } catch (error) {
            this.logger.logError('getTermsListAdmin', '약관 전체 목록 조회', error);
            throw error;
        }
    }
}
