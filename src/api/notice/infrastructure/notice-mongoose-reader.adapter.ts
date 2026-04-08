import { Injectable } from '@nestjs/common';

import { NoticeReaderPort, NoticeSnapshot, NoticeStatus } from '../application/ports/notice-reader.port';
import { NoticeRepository } from '../repository/notice.repository';

@Injectable()
export class NoticeMongooseReaderAdapter implements NoticeReaderPort {
    constructor(private readonly noticeRepository: NoticeRepository) {}

    async countByStatus(status?: NoticeStatus): Promise<number> {
        return this.noticeRepository.countByStatus(status);
    }

    async readPage(skip: number, limit: number, status?: NoticeStatus): Promise<NoticeSnapshot[]> {
        const notices = await this.noticeRepository.findPage(skip, limit, status);

        return notices.map((notice) => this.toSnapshot(notice));
    }

    async readById(noticeId: string): Promise<NoticeSnapshot | null> {
        const notice = await this.noticeRepository.findById(noticeId);
        return notice ? this.toSnapshot(notice) : null;
    }

    async incrementViewCount(noticeId: string): Promise<void> {
        await this.noticeRepository.incrementViewCount(noticeId);
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
