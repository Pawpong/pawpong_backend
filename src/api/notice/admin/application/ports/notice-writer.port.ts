import { NoticeSnapshot } from '../../../application/ports/notice-reader.port';
import type { NoticeCreateCommand, NoticeUpdateCommand } from '../types/notice-command.type';

export const NOTICE_WRITER_PORT = Symbol('NOTICE_WRITER_PORT');

export interface NoticeWriterPort {
    create(adminId: string, adminName: string, createData: NoticeCreateCommand): Promise<NoticeSnapshot>;
    update(noticeId: string, updateData: NoticeUpdateCommand): Promise<NoticeSnapshot | null>;
    delete(noticeId: string): Promise<boolean>;
}
