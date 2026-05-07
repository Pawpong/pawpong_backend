import type { TermsCode } from '../../../../schema/terms.schema';

export type TermsItemResult = {
    termsId: string;
    code: TermsCode;
    version: string;
    title: string;
    body: string;
    isRequired: boolean;
    activatedAt?: string;
    createdAt: string;
    updatedAt: string;
};
