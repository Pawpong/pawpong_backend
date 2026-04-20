import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { NOTICE_WRITER_PORT, type NoticeWriterPort } from '../ports/notice-writer.port';

@Injectable()
export class DeleteNoticeUseCase {
    constructor(
        @Inject(NOTICE_WRITER_PORT)
        private readonly noticeWriter: NoticeWriterPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(noticeId: string, adminId: string): Promise<void> {
        this.logger.logStart('deleteNotice', '공지사항 삭제 시작', { noticeId, adminId });

        if (!noticeId) {
            throw new DomainValidationError('공지사항 ID가 필요합니다.');
        }

        if (!adminId) {
            throw new DomainValidationError('관리자 정보가 올바르지 않습니다.');
        }

        try {
            const deleted = await this.noticeWriter.delete(noticeId);

            if (!deleted) {
                throw new DomainNotFoundError('공지사항을 찾을 수 없습니다.');
            }

            this.logger.logSuccess('deleteNotice', '공지사항 삭제 완료', { noticeId });
        } catch (error) {
            this.logger.logError('deleteNotice', '공지사항 삭제', error);
            throw error;
        }
    }
}
