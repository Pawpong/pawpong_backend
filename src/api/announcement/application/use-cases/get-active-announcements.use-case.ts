import { Injectable } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { AnnouncementResponseDto } from '../../dto/response/announcement-response.dto';
import { AnnouncementPublicReaderPort } from '../ports/announcement-public-reader.port';
import { AnnouncementResponseMapperService } from '../../domain/services/announcement-response-mapper.service';
import { PaginationRequestDto } from '../../../../common/dto/pagination/pagination-request.dto';

@Injectable()
export class GetActiveAnnouncementsUseCase {
    constructor(
        private readonly announcementPublicReaderPort: AnnouncementPublicReaderPort,
        private readonly announcementResponseMapperService: AnnouncementResponseMapperService,
    ) {}

    async execute(
        paginationDto: PaginationRequestDto,
    ): Promise<PaginationResponseDto<AnnouncementResponseDto>> {
        const page = paginationDto.page ?? 1;
        const limit = paginationDto.limit ?? 10;

        const result = await this.announcementPublicReaderPort.findActiveAnnouncements({
            page,
            limit,
        });

        return this.announcementResponseMapperService.toPaginationResponse(result);
    }
}
