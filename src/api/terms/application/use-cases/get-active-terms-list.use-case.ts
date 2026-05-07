import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { TermsItemMapperService } from '../../domain/services/terms-item-mapper.service';
import { TERMS_READER_PORT, type TermsReaderPort } from '../ports/terms-reader.port';
import type { TermsItemResult } from '../types/terms-result.type';

@Injectable()
export class GetActiveTermsListUseCase {
    constructor(
        @Inject(TERMS_READER_PORT)
        private readonly termsReader: TermsReaderPort,
        private readonly termsItemMapperService: TermsItemMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(): Promise<TermsItemResult[]> {
        this.logger.logStart('getActiveTermsList', '활성 약관 목록 조회 시작');

        try {
            const items = await this.termsReader.readActiveAll();
            const result = items.map((item) => this.termsItemMapperService.toItem(item));

            this.logger.logSuccess('getActiveTermsList', '활성 약관 목록 조회 완료', { count: result.length });
            return result;
        } catch (error) {
            this.logger.logError('getActiveTermsList', '활성 약관 목록 조회', error);
            throw error;
        }
    }
}
