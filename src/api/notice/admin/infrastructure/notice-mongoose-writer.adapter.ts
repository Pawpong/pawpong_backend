import { Injectable } from '@nestjs/common';

import { NoticeSnapshot } from '../../application/ports/notice-reader.port';
import { NoticeCreateRequestDto } from '../../dto/request/notice-create-request.dto';
import { NoticeUpdateRequestDto } from '../../dto/request/notice-update-request.dto';
import { NoticeWriterPort } from '../application/ports/notice-writer.port';
import { NoticeRepository } from '../../repository/notice.repository';

@Injectable()
export class NoticeMongooseWriterAdapter implements NoticeWriterPort {
    constructor(private readonly noticeRepository: NoticeRepository) {}

    async create(adminId: string, adminName: string, createData: NoticeCreateRequestDto): Promise<NoticeSnapshot> {
        const notice = await this.noticeRepository.create(adminId, adminName, createData);
        return this.toSnapshot(notice);
    }

    async update(noticeId: string, updateData: NoticeUpdateRequestDto): Promise<NoticeSnapshot | null> {
        const notice = await this.noticeRepository.update(noticeId, updateData);
        if (!notice) {
            return null;
        }
        return this.toSnapshot(notice);
    }

    async delete(noticeId: string): Promise<boolean> {
        return this.noticeRepository.deleteById(noticeId);
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
