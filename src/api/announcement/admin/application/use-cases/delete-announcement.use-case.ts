import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { ANNOUNCEMENT_WRITER, type AnnouncementWriterPort } from '../ports/announcement-writer.port';

@Injectable()
export class DeleteAnnouncementUseCase {
    constructor(
        @Inject(ANNOUNCEMENT_WRITER)
        private readonly announcementWriter: AnnouncementWriterPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(announcementId: string): Promise<void> {
        this.logger.logStart('deleteAnnouncement', '공지사항 삭제', {
            announcementId,
        });

        if (!Types.ObjectId.isValid(announcementId)) {
            throw new BadRequestException('올바르지 않은 공지사항 ID입니다.');
        }

        try {
            const deleted = await this.announcementWriter.delete(announcementId);

            if (!deleted) {
                throw new BadRequestException('공지사항을 찾을 수 없습니다.');
            }

            this.logger.logSuccess('deleteAnnouncement', '공지사항 삭제 완료', {
                announcementId,
            });
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            this.logger.logError('deleteAnnouncement', '공지사항 삭제 실패', error);
            throw new BadRequestException('공지사항을 삭제할 수 없습니다.');
        }
    }
}
