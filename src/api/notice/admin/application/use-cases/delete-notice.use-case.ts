import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { NOTICE_WRITER, type NoticeWriterPort } from '../ports/notice-writer.port';

@Injectable()
export class DeleteNoticeUseCase {
    constructor(
        @Inject(NOTICE_WRITER)
        private readonly noticeWriter: NoticeWriterPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(noticeId: string, adminId: string): Promise<void> {
        this.logger.logStart('deleteNotice', '공지사항 삭제 시작', { noticeId, adminId });

        if (!noticeId) {
            throw new BadRequestException('공지사항 ID가 필요합니다.');
        }

        if (!adminId) {
            throw new BadRequestException('관리자 정보가 올바르지 않습니다.');
        }

        try {
            const deleted = await this.noticeWriter.delete(noticeId);

            if (!deleted) {
                throw new NotFoundException('공지사항을 찾을 수 없습니다.');
            }

            this.logger.logSuccess('deleteNotice', '공지사항 삭제 완료', { noticeId });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            this.logger.logError('deleteNotice', '공지사항 삭제', error);
            throw new BadRequestException('공지사항 삭제에 실패했습니다.');
        }
    }
}
