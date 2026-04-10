import { Injectable } from '@nestjs/common';

import {
    type AnnouncementPublicItem,
    type AnnouncementPublicListResult,
} from '../../application/ports/announcement-public-reader.port';
import type { AnnouncementPageResult, AnnouncementResult } from '../../application/types/announcement-result.type';
import { AnnouncementPaginationAssemblerService } from './announcement-pagination-assembler.service';

@Injectable()
export class AnnouncementResponseMapperService {
    constructor(private readonly announcementPaginationAssemblerService: AnnouncementPaginationAssemblerService) {}

    toPaginationResponse(result: AnnouncementPublicListResult): AnnouncementPageResult {
        return this.announcementPaginationAssemblerService.build(
            result.items.map((item) => this.toResponse(item)),
            result.page,
            result.limit,
            result.totalCount,
        );
    }

    toResponse(item: AnnouncementPublicItem): AnnouncementResult {
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
