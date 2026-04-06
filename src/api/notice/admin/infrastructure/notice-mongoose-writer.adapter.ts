import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Notice } from '../../../../schema/notice.schema';
import { NoticeSnapshot } from '../../application/ports/notice-reader.port';
import { NoticeCreateRequestDto } from '../../dto/request/notice-create-request.dto';
import { NoticeUpdateRequestDto } from '../../dto/request/notice-update-request.dto';
import { NoticeWriterPort } from '../application/ports/notice-writer.port';

@Injectable()
export class NoticeMongooseWriterAdapter implements NoticeWriterPort {
    constructor(@InjectModel(Notice.name) private readonly noticeModel: Model<Notice>) {}

    async create(adminId: string, adminName: string, createData: NoticeCreateRequestDto): Promise<NoticeSnapshot> {
        const notice = new this.noticeModel({
            ...createData,
            authorId: adminId,
            authorName: adminName,
            status: createData.status || 'published',
            isPinned: createData.isPinned || false,
            viewCount: 0,
        });

        await notice.save();

        return this.toSnapshot(notice);
    }

    async update(noticeId: string, updateData: NoticeUpdateRequestDto): Promise<NoticeSnapshot | null> {
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

        await notice.save();
        return this.toSnapshot(notice);
    }

    async delete(noticeId: string): Promise<boolean> {
        const result = await this.noticeModel.findByIdAndDelete(noticeId).exec();
        return !!result;
    }

    private toSnapshot(notice: any): NoticeSnapshot {
        return {
            id: notice._id.toString(),
            title: notice.title,
            content: notice.content,
            authorName: notice.authorName,
            status: notice.status,
            isPinned: notice.isPinned,
            viewCount: notice.viewCount || 0,
            publishedAt: notice.publishedAt,
            expiredAt: notice.expiredAt,
            createdAt: notice.createdAt,
            updatedAt: notice.updatedAt,
        };
    }
}
