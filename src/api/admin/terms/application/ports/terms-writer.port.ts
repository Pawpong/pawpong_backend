import type { TermsCode } from '../../../../../schema/terms.schema';
import type { TermsSnapshot } from '../../../../service/terms/application/ports/terms-reader.port';
import type { TermsCreateCommand, TermsUpdateCommand } from '../types/terms-command.type';

export const TERMS_WRITER_PORT = Symbol('TERMS_WRITER_PORT');

export interface TermsWriterPort {
    findAll(): Promise<TermsSnapshot[]>;
    findById(termsId: string): Promise<TermsSnapshot | null>;
    /** code+version 중복 생성을 막기 위한 조회 */
    findByCodeAndVersion(code: TermsCode, version: string): Promise<TermsSnapshot | null>;
    create(createData: TermsCreateCommand): Promise<TermsSnapshot>;
    update(termsId: string, updateData: TermsUpdateCommand): Promise<TermsSnapshot | null>;
    /** 같은 code 의 기존 활성 버전을 비활성화하고 이 버전을 활성화한다 */
    activate(termsId: string): Promise<TermsSnapshot | null>;
    delete(termsId: string): Promise<boolean>;
}
