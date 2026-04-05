import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Announcement, AnnouncementDocument } from '../../../schema/announcement.schema';
import {
    AnnouncementPublicReaderPort,
    type AnnouncementPublicItem,
    type AnnouncementPublicListQuery,
    type AnnouncementPublicListResult,
} from '../application/ports/announcement-public-reader.port';

@Injectable()
export class AnnouncementMongoosePublicReaderAdapter extends AnnouncementPublicReaderPort {
    constructor(
        @InjectModel(Announcement.name)
        private readonly announcementModel: Model<AnnouncementDocument>,
    ) {
        super();
    }

    async findActiveAnnouncements(query: AnnouncementPublicListQuery): Promise<AnnouncementPublicListResult> {
        const skip = (query.page - 1) * query.limit;

        const [announcements, totalCount] = await Promise.all([
            this.announcementModel
                .find({ isActive: true })
                .sort({ order: 1, createdAt: -1 })
                .skip(skip)
                .limit(query.limit)
                .lean()
                .exec(),
            this.announcementModel.countDocuments({ isActive: true }).exec(),
        ]);

        return {
            items: announcements.map((announcement) => this.toItem(announcement)),
            totalCount,
            page: query.page,
            limit: query.limit,
        };
    }

    async findActiveAnnouncementById(announcementId: string): Promise<AnnouncementPublicItem | null> {
        const announcement = await this.announcementModel
            .findOne({
                _id: announcementId,
                isActive: true,
            })
            .lean()
            .exec();

        return announcement ? this.toItem(announcement) : null;
    }

    private toItem(announcement: any): AnnouncementPublicItem {
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
