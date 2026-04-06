import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Announcement } from '../../../../schema/announcement.schema';
import { AnnouncementPublicItem } from '../../application/ports/announcement-public-reader.port';
import { AnnouncementCreateRequestDto } from '../../dto/request/announcement-create-request.dto';
import { AnnouncementUpdateRequestDto } from '../../dto/request/announcement-update-request.dto';
import { AnnouncementWriterPort } from '../application/ports/announcement-writer.port';

@Injectable()
export class AnnouncementMongooseWriterAdapter implements AnnouncementWriterPort {
    constructor(@InjectModel(Announcement.name) private readonly announcementModel: Model<Announcement>) {}

    async create(createData: AnnouncementCreateRequestDto): Promise<AnnouncementPublicItem> {
        const announcement = new this.announcementModel({
            title: createData.title,
            content: createData.content,
            isActive: createData.isActive ?? true,
            order: createData.order ?? 0,
        });

        await announcement.save();

        return this.toItem(announcement);
    }

    async update(
        announcementId: string,
        updateData: AnnouncementUpdateRequestDto,
    ): Promise<AnnouncementPublicItem | null> {
        if (!Types.ObjectId.isValid(announcementId)) {
            return null;
        }

        const announcement = await this.announcementModel.findById(announcementId).exec();

        if (!announcement) {
            return null;
        }

        if (updateData.title !== undefined) announcement.title = updateData.title;
        if (updateData.content !== undefined) announcement.content = updateData.content;
        if (updateData.isActive !== undefined) announcement.isActive = updateData.isActive;
        if (updateData.order !== undefined) announcement.order = updateData.order;

        await announcement.save();

        return this.toItem(announcement);
    }

    async delete(announcementId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(announcementId)) {
            return false;
        }

        const deleted = await this.announcementModel.findByIdAndDelete(announcementId).exec();
        return !!deleted;
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
