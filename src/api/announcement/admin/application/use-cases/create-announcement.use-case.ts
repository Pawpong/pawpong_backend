import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { AnnouncementResponseDto } from '../../../dto/response/announcement-response.dto';
import { AnnouncementResponseMapperService } from '../../../domain/services/announcement-response-mapper.service';
import { ANNOUNCEMENT_WRITER, type AnnouncementWriterPort } from '../ports/announcement-writer.port';
import type { AnnouncementCreateCommand } from '../types/announcement-command.type';

@Injectable()
export class CreateAnnouncementUseCase {
    constructor(
        @Inject(ANNOUNCEMENT_WRITER)
        private readonly announcementWriter: AnnouncementWriterPort,
        private readonly announcementResponseMapperService: AnnouncementResponseMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(createDto: AnnouncementCreateCommand): Promise<AnnouncementResponseDto> {
        this.logger.logStart('createAnnouncement', '공지사항 생성', createDto);

        try {
            const announcement = await this.announcementWriter.create(createDto);

            this.logger.logSuccess('createAnnouncement', '공지사항 생성 완료', {
                announcementId: announcement.announcementId,
            });

            return this.announcementResponseMapperService.toResponse(announcement);
        } catch (error) {
            this.logger.logError('createAnnouncement', '공지사항 생성 실패', error);
            throw new BadRequestException('공지사항을 생성할 수 없습니다.');
        }
    }
}
