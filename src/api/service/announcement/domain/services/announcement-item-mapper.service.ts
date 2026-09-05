import { Injectable } from '@nestjs/common';

import { type AnnouncementPublicItem } from '../../application/ports/announcement-public-reader.port';
import type { AnnouncementResult } from '../../application/types/announcement-result.type';

@Injectable()
export class AnnouncementItemMapperService {
    toItem(item: AnnouncementPublicItem): AnnouncementResult {
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
