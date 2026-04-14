import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { rethrowIfHttpException } from '../../../../../common/utils/http-exception.util';
import { AnnouncementItemMapperService } from '../../../domain/services/announcement-item-mapper.service';
import { ANNOUNCEMENT_WRITER_PORT, type AnnouncementWriterPort } from '../ports/announcement-writer.port';
import type { AnnouncementUpdateCommand } from '../types/announcement-command.type';
import type { AnnouncementResult } from '../../../application/types/announcement-result.type';

@Injectable()
export class UpdateAnnouncementUseCase {
    constructor(
        @Inject(ANNOUNCEMENT_WRITER_PORT)
        private readonly announcementWriter: AnnouncementWriterPort,
        private readonly announcementItemMapperService: AnnouncementItemMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(
        announcementId: string,
        updateDto: AnnouncementUpdateCommand,
    ): Promise<AnnouncementResult> {
        this.logger.logStart('updateAnnouncement', '공지사항 수정', {
            announcementId,
            ...updateDto,
        });

        if (!Types.ObjectId.isValid(announcementId)) {
            throw new BadRequestException('올바르지 않은 공지사항 ID입니다.');
        }

        try {
            const announcement = await this.announcementWriter.update(announcementId, updateDto);

            if (!announcement) {
                throw new BadRequestException('공지사항을 찾을 수 없습니다.');
            }

            this.logger.logSuccess('updateAnnouncement', '공지사항 수정 완료', {
                announcementId,
            });

            return this.announcementItemMapperService.toItem(announcement);
        } catch (error) {
            rethrowIfHttpException(error);
            this.logger.logError('updateAnnouncement', '공지사항 수정 실패', error);
            throw new BadRequestException('공지사항을 수정할 수 없습니다.');
        }
    }
}
