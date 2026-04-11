import { Injectable } from '@nestjs/common';
import { AnnouncementDocument } from '../../../schema/announcement.schema';

import {
    type AnnouncementPublicItem,
    type AnnouncementPublicListQuery,
    type AnnouncementPublicListResult,
    type AnnouncementPublicReaderPort,
} from '../application/ports/announcement-public-reader.port';
import { AnnouncementRepository } from '../repository/announcement.repository';

@Injectable()
export class AnnouncementMongoosePublicReaderAdapter implements AnnouncementPublicReaderPort {
    constructor(private readonly announcementRepository: AnnouncementRepository) {}

    async findActiveAnnouncements(query: AnnouncementPublicListQuery): Promise<AnnouncementPublicListResult> {
        const skip = (query.page - 1) * query.limit;

        const [announcements, totalCount] = await Promise.all([
            this.announcementRepository.findActivePage(skip, query.limit),
            this.announcementRepository.countActive(),
        ]);

        return {
            items: announcements.map((announcement) => this.toItem(announcement)),
            totalCount,
            page: query.page,
            limit: query.limit,
        };
    }

    async findActiveAnnouncementById(announcementId: string): Promise<AnnouncementPublicItem | null> {
        const announcement = await this.announcementRepository.findActiveById(announcementId);
        return announcement ? this.toItem(announcement) : null;
    }

    private toItem(announcement: AnnouncementDocument): AnnouncementPublicItem {
        return {
            announcementId: announcement._id.toString(),
            title: announcement.title,
            content: announcement.content,
            isActive: announcement.isActive,
            order: announcement.order,
            createdAt: announcement.createdAt,
            updatedAt: announcement.updatedAt,
        };
    }
}
