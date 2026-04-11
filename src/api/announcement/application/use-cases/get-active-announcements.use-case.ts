import { Inject, Injectable } from '@nestjs/common';

import {
    ANNOUNCEMENT_PUBLIC_READER_PORT,
    type AnnouncementPublicReaderPort,
} from '../ports/announcement-public-reader.port';
import { AnnouncementResponseMapperService } from '../../domain/services/announcement-response-mapper.service';
import { PaginationRequestDto } from '../../../../common/dto/pagination/pagination-request.dto';
import type { AnnouncementPageResult } from '../types/announcement-result.type';

@Injectable()
export class GetActiveAnnouncementsUseCase {
    constructor(
        @Inject(ANNOUNCEMENT_PUBLIC_READER_PORT)
        private readonly announcementPublicReaderPort: AnnouncementPublicReaderPort,
        private readonly announcementResponseMapperService: AnnouncementResponseMapperService,
    ) {}

    async execute(
        paginationDto: PaginationRequestDto,
    ): Promise<AnnouncementPageResult> {
        const page = paginationDto.page ?? 1;
        const limit = paginationDto.limit ?? 10;

        const result = await this.announcementPublicReaderPort.findActiveAnnouncements({
            page,
            limit,
        });

        return this.announcementResponseMapperService.toPaginationResponse(result);
    }
}
