import { Inject, Injectable } from '@nestjs/common';

import { DomainConflictError, DomainValidationError } from '../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { TermsItemMapperService } from '../../../../service/terms/domain/services/terms-item-mapper.service';
import { TERMS_WRITER_PORT, type TermsWriterPort } from '../ports/terms-writer.port';
import type { TermsCreateCommand } from '../types/terms-command.type';
import type { TermsItemResult } from '../../../../service/terms/application/types/terms-result.type';

@Injectable()
export class CreateTermsUseCase {
    constructor(
        @Inject(TERMS_WRITER_PORT)
        private readonly termsWriter: TermsWriterPort,
        private readonly termsItemMapperService: TermsItemMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(adminId: string, createData: TermsCreateCommand): Promise<TermsItemResult> {
        this.logger.logStart('createTerms', '약관 생성 시작', { adminId, createData });

        if (!adminId) {
            throw new DomainValidationError('관리자 정보가 올바르지 않습니다.');
        }

        try {
            // code+version 은 유니크 인덱스라, 사전 확인 없이 저장하면 드라이버의 E11000 이 그대로 500 으로 샌다.
            const duplicated = await this.termsWriter.findByCodeAndVersion(createData.code, createData.version);

            if (duplicated) {
                throw new DomainConflictError(
                    `이미 존재하는 약관 버전입니다: ${createData.code} ${createData.version}`,
                );
            }

            const terms = await this.termsWriter.create(createData);

            this.logger.logSuccess('createTerms', '약관 생성 완료', { termsId: terms.id });

            return this.termsItemMapperService.toItem(terms);
        } catch (error) {
            this.logger.logError('createTerms', '약관 생성', error);
            throw error;
        }
    }
}
