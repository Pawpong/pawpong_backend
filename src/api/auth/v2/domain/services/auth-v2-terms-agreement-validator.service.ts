import { BadRequestException, Injectable } from '@nestjs/common';

import type { TermsSnapshot } from '../../../../terms/application/ports/terms-reader.port';
import type { TermsAgreementInput } from '../../application/types/auth-signup-v2.type';

export type ValidatedTermsAgreement = {
    code: string;
    version: string;
    agreedAt: Date;
};

/**
 * v2 가입 시 약관 동의 검증 서비스
 * - 모든 필수 약관(isRequired=true)이 동의되어 있는지 확인
 * - 클라이언트가 보낸 version 이 서버의 활성 버전과 일치하는지 확인
 * - 동의 시각은 서버 시각으로 강제 (클라이언트 조작 방지)
 */
@Injectable()
export class AuthV2TermsAgreementValidatorService {
    validate(activeTerms: TermsSnapshot[], submitted: TermsAgreementInput[]): ValidatedTermsAgreement[] {
        if (activeTerms.length === 0) {
            throw new BadRequestException('등록된 활성 약관이 없습니다. 관리자에게 문의하세요.');
        }

        const submittedByCode = new Map<string, TermsAgreementInput>();
        for (const item of submitted ?? []) {
            submittedByCode.set(item.code, item);
        }

        const activeByCode = new Map<string, TermsSnapshot>();
        for (const term of activeTerms) {
            activeByCode.set(term.code, term);
        }

        // 1) 필수 약관 누락 검사
        const missingRequired = activeTerms
            .filter((term) => term.isRequired && !submittedByCode.has(term.code))
            .map((term) => term.code);

        if (missingRequired.length > 0) {
            throw new BadRequestException(
                `필수 약관 동의가 누락되었습니다: ${missingRequired.join(', ')}`,
            );
        }

        // 2) 제출된 항목이 활성 약관 목록에 존재하는지 + 버전 일치 검증
        const validated: ValidatedTermsAgreement[] = [];
        const now = new Date();

        for (const [code, item] of submittedByCode) {
            const active = activeByCode.get(code);

            if (!active) {
                throw new BadRequestException(`알 수 없거나 비활성화된 약관입니다: ${code}`);
            }

            if (item.version !== active.version) {
                throw new BadRequestException(
                    `약관 ${code} 의 버전이 일치하지 않습니다. 최신 버전(${active.version})으로 다시 동의해주세요.`,
                );
            }

            validated.push({
                code,
                version: active.version,
                agreedAt: now,
            });
        }

        return validated;
    }
}
