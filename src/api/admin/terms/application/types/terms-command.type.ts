import type { TermsCode } from '../../../../../schema/terms.schema';

export type TermsCreateCommand = {
    code: TermsCode;
    version: string;
    title: string;
    body: string;
    isRequired?: boolean;
    /** true 면 생성과 동시에 활성화한다 (같은 code 의 기존 활성 버전은 비활성화) */
    activate?: boolean;
};

export type TermsUpdateCommand = {
    title?: string;
    body?: string;
    isRequired?: boolean;
};
