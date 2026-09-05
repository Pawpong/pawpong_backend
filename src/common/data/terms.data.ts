import type { TermsCode } from '../../schema/terms.schema';

export type SeedTermsItem = {
    code: TermsCode;
    version: string;
    title: string;
    body: string;
    isRequired: boolean;
};

const DEVELOPMENT_TERMS_VERSION = '2026-08-16-dev';
const DEVELOPMENT_NOTICE =
    '개발 환경의 회원가입 흐름 검증을 위한 임시 약관입니다. 실제 서비스 적용 전 승인된 약관 본문과 버전으로 교체해야 합니다.';

export const DEVELOPMENT_TERMS: readonly SeedTermsItem[] = [
    {
        code: 'service',
        version: DEVELOPMENT_TERMS_VERSION,
        title: '서비스 이용약관 (개발용)',
        body: DEVELOPMENT_NOTICE,
        isRequired: true,
    },
    {
        code: 'privacy',
        version: DEVELOPMENT_TERMS_VERSION,
        title: '개인정보 수집 및 이용 동의 (개발용)',
        body: DEVELOPMENT_NOTICE,
        isRequired: true,
    },
    {
        code: 'age_14plus',
        version: DEVELOPMENT_TERMS_VERSION,
        title: '만 14세 이상 확인 (개발용)',
        body: DEVELOPMENT_NOTICE,
        isRequired: true,
    },
    {
        code: 'marketing',
        version: DEVELOPMENT_TERMS_VERSION,
        title: '마케팅 정보 수신 동의 (개발용)',
        body: DEVELOPMENT_NOTICE,
        isRequired: false,
    },
    {
        code: 'counsel_privacy',
        version: DEVELOPMENT_TERMS_VERSION,
        title: '입양 상담 개인정보 수집 및 이용 동의 (개발용)',
        body: DEVELOPMENT_NOTICE,
        isRequired: false,
    },
];
