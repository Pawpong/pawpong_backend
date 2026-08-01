export const CONTEST_ADMIN_WRITER_PORT = Symbol('CONTEST_ADMIN_WRITER_PORT');

export interface ContestAdminWriterPort {
    /** 콘테스트 항목 상태 변경 (hidden: 숨김, deleted: 소프트 삭제) */
    updateEntryStatus(entryId: string, status: 'hidden' | 'deleted'): Promise<void>;
}
