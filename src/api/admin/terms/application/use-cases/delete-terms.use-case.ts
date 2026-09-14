import { Inject, Injectable } from '@nestjs/common';

import {
    DomainConflictError,
    DomainNotFoundError,
    DomainValidationError,
} from '../../../../../common/error/domain.error';
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
            const terms = await this.termsWriter.findById(termsId);

            if (!terms) {
                throw new DomainNotFoundError('해당 약관을 찾을 수 없습니다.');
            }

            // 활성 약관을 지우면 가입 검증이 그 코드를 찾지 못해 입양자 가입이 통째로 막힌다.
            // 동의 이력(code/version)만으로는 본문을 복원할 수 없어 삭제는 되돌릴 수도 없다.
            if (terms.isActive) {
                throw new DomainConflictError(
                    `활성 상태인 약관은 삭제할 수 없습니다. 다른 버전을 활성화한 뒤 삭제해주세요. (${terms.code} ${terms.version})`,
                );
            }

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
