import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Announcement } from '../../../../schema/announcement.schema';
import { AnnouncementPublicListQuery, AnnouncementPublicListResult } from '../../application/ports/announcement-public-reader.port';
import { AnnouncementAdminReaderPort } from '../application/ports/announcement-admin-reader.port';

@Injectable()
export class AnnouncementMongooseAdminReaderAdapter implements AnnouncementAdminReaderPort {
    constructor(@InjectModel(Announcement.name) private readonly announcementModel: Model<Announcement>) {}

    async findAllAnnouncements(query: AnnouncementPublicListQuery): Promise<AnnouncementPublicListResult> {
        const skip = (query.page - 1) * query.limit;

        const [announcements, totalCount] = await Promise.all([
            this.announcementModel
                .find()
                .sort({ order: 1, createdAt: -1 })
                .skip(skip)
                .limit(query.limit)
                .lean()
                .exec(),
            this.announcementModel.countDocuments().exec(),
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
