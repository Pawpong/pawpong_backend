import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Notice } from '../../../schema/notice.schema';
import { NoticeStatus } from '../application/ports/notice-reader.port';
import { NoticeCreateRequestDto } from '../dto/request/notice-create-request.dto';
import { NoticeUpdateRequestDto } from '../dto/request/notice-update-request.dto';

@Injectable()
export class NoticeRepository {
    constructor(@InjectModel(Notice.name) private readonly noticeModel: Model<Notice>) {}

    countByStatus(status?: NoticeStatus): Promise<number> {
        const filter = status ? { status } : {};
        return this.noticeModel.countDocuments(filter).exec();
    }

    findPage(skip: number, limit: number, status?: NoticeStatus): Promise<Notice[]> {
        const filter = status ? { status } : {};
        return this.noticeModel
            .find(filter)
            .sort({ isPinned: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    findById(noticeId: string): Promise<Notice | null> {
        return this.noticeModel.findById(noticeId).exec();
    }

    async incrementViewCount(noticeId: string): Promise<void> {
        await this.noticeModel.findByIdAndUpdate(noticeId, { $inc: { viewCount: 1 } }).exec();
    }

    async create(adminId: string, adminName: string, createData: NoticeCreateRequestDto): Promise<Notice> {
        const notice = new this.noticeModel({
            ...createData,
            authorId: adminId,
            authorName: adminName,
            status: createData.status || 'published',
            isPinned: createData.isPinned || false,
            viewCount: 0,
        });

        return notice.save();
    }

    async update(noticeId: string, updateData: NoticeUpdateRequestDto): Promise<Notice | null> {
        const notice = await this.noticeModel.findById(noticeId).exec();

        if (!notice) {
            return null;
        }

        if (updateData.title !== undefined) notice.title = updateData.title;
        if (updateData.content !== undefined) notice.content = updateData.content;
        if (updateData.status !== undefined) notice.status = updateData.status;
        if (updateData.isPinned !== undefined) notice.isPinned = updateData.isPinned;
        if (updateData.publishedAt !== undefined) notice.publishedAt = new Date(updateData.publishedAt);
        if (updateData.expiredAt !== undefined) notice.expiredAt = new Date(updateData.expiredAt);

        return notice.save();
    }

    async deleteById(noticeId: string): Promise<boolean> {
        const deleted = await this.noticeModel.findByIdAndDelete(noticeId).exec();
        return !!deleted;
    }
}
