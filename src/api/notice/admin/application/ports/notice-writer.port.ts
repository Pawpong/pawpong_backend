import { NoticeCreateRequestDto } from '../../../dto/request/notice-create-request.dto';
import { NoticeUpdateRequestDto } from '../../../dto/request/notice-update-request.dto';
import { NoticeSnapshot } from '../../../application/ports/notice-reader.port';

export const NOTICE_WRITER = Symbol('NOTICE_WRITER');

export interface NoticeWriterPort {
    create(adminId: string, adminName: string, createData: NoticeCreateRequestDto): Promise<NoticeSnapshot>;
    update(noticeId: string, updateData: NoticeUpdateRequestDto): Promise<NoticeSnapshot | null>;
    delete(noticeId: string): Promise<boolean>;
}
