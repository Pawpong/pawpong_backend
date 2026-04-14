import { Inject, Injectable } from '@nestjs/common';

import {
    ANNOUNCEMENT_PUBLIC_READER_PORT,
    type AnnouncementPublicReaderPort,
} from '../ports/announcement-public-reader.port';
import { AnnouncementPageAssemblerService } from '../../domain/services/announcement-page-assembler.service';
import type { AnnouncementPageQuery } from '../types/announcement-query.type';
import type { AnnouncementPageResult } from '../types/announcement-result.type';

@Injectable()
export class GetActiveAnnouncementsUseCase {
    constructor(
        @Inject(ANNOUNCEMENT_PUBLIC_READER_PORT)
        private readonly announcementPublicReaderPort: AnnouncementPublicReaderPort,
        private readonly announcementPageAssemblerService: AnnouncementPageAssemblerService,
    ) {}

    async execute(paginationDto: AnnouncementPageQuery): Promise<AnnouncementPageResult> {
        const page = paginationDto.page ?? 1;
        const limit = paginationDto.limit ?? 10;

        const result = await this.announcementPublicReaderPort.findActiveAnnouncements({
            page,
            limit,
        });

        return this.announcementPageAssemblerService.build(result);
    }
}
