import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Announcement, AnnouncementDocument } from '../../../schema/announcement.schema';
import type {
    AnnouncementCreateCommand,
    AnnouncementUpdateCommand,
} from '../admin/application/types/announcement-command.type';

@Injectable()
export class AnnouncementRepository {
    constructor(
        @InjectModel(Announcement.name)
        private readonly announcementModel: Model<AnnouncementDocument>,
    ) {}

    findActivePage(skip: number, limit: number): Promise<AnnouncementDocument[]> {
        return this.announcementModel
            .find({ isActive: true })
            .sort({ order: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    countActive(): Promise<number> {
        return this.announcementModel.countDocuments({ isActive: true }).exec();
    }

    findAllPage(skip: number, limit: number): Promise<AnnouncementDocument[]> {
        return this.announcementModel.find().sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).exec();
    }

    countAll(): Promise<number> {
        return this.announcementModel.countDocuments().exec();
    }

    findActiveById(announcementId: string): Promise<AnnouncementDocument | null> {
        if (!Types.ObjectId.isValid(announcementId)) {
            return Promise.resolve(null);
        }

        return this.announcementModel.findOne({ _id: announcementId, isActive: true }).exec();
    }

    async create(createData: AnnouncementCreateCommand): Promise<AnnouncementDocument> {
        const announcement = new this.announcementModel({
            title: createData.title,
            content: createData.content,
            isActive: createData.isActive ?? true,
            order: createData.order ?? 0,
        });

        return announcement.save();
    }

    async update(announcementId: string, updateData: AnnouncementUpdateCommand): Promise<AnnouncementDocument | null> {
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

        return announcement.save();
    }

    async deleteById(announcementId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(announcementId)) {
            return false;
        }

        const deleted = await this.announcementModel.findByIdAndDelete(announcementId).exec();
        return !!deleted;
    }
}
