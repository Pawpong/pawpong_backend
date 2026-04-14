import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { rethrowIfHttpException } from '../../../../../common/utils/http-exception.util';
import { AnnouncementItemMapperService } from '../../../domain/services/announcement-item-mapper.service';
import { ANNOUNCEMENT_WRITER_PORT, type AnnouncementWriterPort } from '../ports/announcement-writer.port';
import type { AnnouncementCreateCommand } from '../types/announcement-command.type';
import type { AnnouncementResult } from '../../../application/types/announcement-result.type';

@Injectable()
export class CreateAnnouncementUseCase {
    constructor(
        @Inject(ANNOUNCEMENT_WRITER_PORT)
        private readonly announcementWriter: AnnouncementWriterPort,
        private readonly announcementItemMapperService: AnnouncementItemMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(createDto: AnnouncementCreateCommand): Promise<AnnouncementResult> {
        this.logger.logStart('createAnnouncement', '공지사항 생성', createDto);

        try {
            const announcement = await this.announcementWriter.create(createDto);

            this.logger.logSuccess('createAnnouncement', '공지사항 생성 완료', {
                announcementId: announcement.announcementId,
            });

            return this.announcementItemMapperService.toItem(announcement);
        } catch (error) {
            rethrowIfHttpException(error);
            this.logger.logError('createAnnouncement', '공지사항 생성 실패', error);
            throw new BadRequestException('공지사항을 생성할 수 없습니다.');
        }
    }
}
