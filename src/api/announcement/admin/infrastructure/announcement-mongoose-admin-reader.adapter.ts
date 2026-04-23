import { Injectable } from '@nestjs/common';

import {
    AnnouncementPublicListQuery,
    AnnouncementPublicListResult,
} from '../../application/ports/announcement-public-reader.port';
import { AnnouncementAdminReaderPort } from '../application/ports/announcement-admin-reader.port';
import { AnnouncementRepository } from '../../repository/announcement.repository';

@Injectable()
export class AnnouncementMongooseAdminReaderAdapter implements AnnouncementAdminReaderPort {
    constructor(private readonly announcementRepository: AnnouncementRepository) {}

    async findAllAnnouncements(query: AnnouncementPublicListQuery): Promise<AnnouncementPublicListResult> {
        const skip = (query.page - 1) * query.limit;

        const [announcements, totalCount] = await Promise.all([
            this.announcementRepository.findAllPage(skip, query.limit),
            this.announcementRepository.countAll(),
        ]);

        return {
            items: announcements.map((announcement) => ({
                announcementId: announcement._id.toString(),
                title: announcement.title,
                content: announcement.content,
                isActive: announcement.isActive,
                order: announcement.order,
                createdAt: announcement.createdAt,
                updatedAt: announcement.updatedAt,
            })),
            totalCount,
            page: query.page,
            limit: query.limit,
        };
    }
}
