import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { TermsCode } from '../../../../schema/terms.schema';
import { TermsItemMapperService } from '../../domain/services/terms-item-mapper.service';
import { TERMS_READER_PORT, type TermsReaderPort } from '../ports/terms-reader.port';
import type { TermsItemResult } from '../types/terms-result.type';

@Injectable()
export class GetActiveTermByCodeUseCase {
    constructor(
        @Inject(TERMS_READER_PORT)
        private readonly termsReader: TermsReaderPort,
        private readonly termsItemMapperService: TermsItemMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(code: TermsCode): Promise<TermsItemResult> {
        this.logger.logStart('getActiveTermByCode', '활성 약관 단건 조회 시작', { code });

        try {
            const item = await this.termsReader.readActiveByCode(code);

            if (!item) {
                throw new BadRequestException('해당 약관을 찾을 수 없습니다.');
            }

            const result = this.termsItemMapperService.toItem(item);
            this.logger.logSuccess('getActiveTermByCode', '활성 약관 단건 조회 완료', { code });
            return result;
        } catch (error) {
            this.logger.logError('getActiveTermByCode', '활성 약관 단건 조회', error);
            throw error;
        }
    }
}
