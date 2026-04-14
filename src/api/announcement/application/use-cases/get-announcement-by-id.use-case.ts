import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
    ANNOUNCEMENT_PUBLIC_READER_PORT,
    type AnnouncementPublicReaderPort,
} from '../ports/announcement-public-reader.port';
import { AnnouncementItemMapperService } from '../../domain/services/announcement-item-mapper.service';
import type { AnnouncementResult } from '../types/announcement-result.type';

@Injectable()
export class GetAnnouncementByIdUseCase {
    constructor(
        @Inject(ANNOUNCEMENT_PUBLIC_READER_PORT)
        private readonly announcementPublicReaderPort: AnnouncementPublicReaderPort,
        private readonly announcementItemMapperService: AnnouncementItemMapperService,
    ) {}

    async execute(announcementId: string): Promise<AnnouncementResult> {
        const announcement = await this.announcementPublicReaderPort.findActiveAnnouncementById(announcementId);

        if (!announcement) {
            throw new BadRequestException('공지사항을 찾을 수 없습니다.');
        }

        return this.announcementItemMapperService.toItem(announcement);
    }
}
