import type { TermsCode } from '../../../../schema/terms.schema';

export interface TermsSnapshot {
    id: string;
    code: TermsCode;
    version: string;
    title: string;
    body: string;
    isRequired: boolean;
    isActive: boolean;
    activatedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export const TERMS_READER_PORT = Symbol('TERMS_READER_PORT');

export interface TermsReaderPort {
    readActiveAll(): Promise<TermsSnapshot[]>;
    readActiveByCode(code: TermsCode): Promise<TermsSnapshot | null>;
}
