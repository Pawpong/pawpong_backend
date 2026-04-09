import { Injectable } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { AnnouncementResponseDto } from '../../dto/response/announcement-response.dto';
import {
    type AnnouncementPublicItem,
    type AnnouncementPublicListResult,
} from '../../application/ports/announcement-public-reader.port';
import { AnnouncementPaginationAssemblerService } from './announcement-pagination-assembler.service';

@Injectable()
export class AnnouncementResponseMapperService {
    constructor(private readonly announcementPaginationAssemblerService: AnnouncementPaginationAssemblerService) {}

    toPaginationResponse(result: AnnouncementPublicListResult): PaginationResponseDto<AnnouncementResponseDto> {
        return this.announcementPaginationAssemblerService.build(
            result.items.map((item) => this.toResponse(item)),
            result.page,
            result.limit,
            result.totalCount,
        );
    }

    toResponse(item: AnnouncementPublicItem): AnnouncementResponseDto {
        return {
            announcementId: item.announcementId,
            title: item.title,
            content: item.content,
            isActive: item.isActive,
            order: item.order,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }
}
