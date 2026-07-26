import { Injectable } from '@nestjs/common';

import { type AnnouncementPublicListResult } from '../../application/ports/announcement-public-reader.port';
import type { AnnouncementPageResult } from '../../application/types/announcement-result.type';
import { AnnouncementPaginationAssemblerService } from './announcement-pagination-assembler.service';
import { AnnouncementItemMapperService } from './announcement-item-mapper.service';

@Injectable()
export class AnnouncementPageAssemblerService {
    constructor(
        private readonly announcementItemMapperService: AnnouncementItemMapperService,
        private readonly announcementPaginationAssemblerService: AnnouncementPaginationAssemblerService,
    ) {}

    build(result: AnnouncementPublicListResult): AnnouncementPageResult {
        return this.announcementPaginationAssemblerService.build(
            result.items.map((item) => this.announcementItemMapperService.toItem(item)),
            result.page,
            result.limit,
            result.totalCount,
        );
    }
}
