import { BadRequestException, Injectable } from '@nestjs/common';

import { AnnouncementPublicReaderPort } from '../ports/announcement-public-reader.port';
import { AnnouncementResponseMapperService } from '../../domain/services/announcement-response-mapper.service';
import type { AnnouncementResult } from '../types/announcement-result.type';

@Injectable()
export class GetAnnouncementByIdUseCase {
    constructor(
        private readonly announcementPublicReaderPort: AnnouncementPublicReaderPort,
        private readonly announcementResponseMapperService: AnnouncementResponseMapperService,
    ) {}

    async execute(announcementId: string): Promise<AnnouncementResult> {
        const announcement = await this.announcementPublicReaderPort.findActiveAnnouncementById(announcementId);

        if (!announcement) {
            throw new BadRequestException('공지사항을 찾을 수 없습니다.');
        }

        return this.announcementResponseMapperService.toResponse(announcement);
    }
}
