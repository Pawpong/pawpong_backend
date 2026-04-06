import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Notice } from '../../../schema/notice.schema';
import { NoticeReaderPort, NoticeSnapshot, NoticeStatus } from '../application/ports/notice-reader.port';

@Injectable()
export class NoticeMongooseReaderAdapter implements NoticeReaderPort {
    constructor(@InjectModel(Notice.name) private readonly noticeModel: Model<Notice>) {}

    async countByStatus(status?: NoticeStatus): Promise<number> {
        const filter = status ? { status } : {};
        return this.noticeModel.countDocuments(filter);
    }

    async readPage(skip: number, limit: number, status?: NoticeStatus): Promise<NoticeSnapshot[]> {
        const filter = status ? { status } : {};
        const notices = await this.noticeModel
            .find(filter)
            .sort({ isPinned: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        return notices.map((notice) => this.toSnapshot(notice));
    }

    async readById(noticeId: string): Promise<NoticeSnapshot | null> {
        const notice = await this.noticeModel.findById(noticeId).lean().exec();
        return notice ? this.toSnapshot(notice) : null;
    }

    async incrementViewCount(noticeId: string): Promise<void> {
        await this.noticeModel.findByIdAndUpdate(noticeId, { $inc: { viewCount: 1 } }).exec();
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
