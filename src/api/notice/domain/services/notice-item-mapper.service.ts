import { Injectable } from '@nestjs/common';

import { NoticeSnapshot } from '../../application/ports/notice-reader.port';
import type { NoticeItemResult } from '../../application/types/notice-result.type';

@Injectable()
export class NoticeItemMapperService {
    toItem(notice: NoticeSnapshot): NoticeItemResult {
        return {
            noticeId: notice.id,
            title: notice.title,
            content: notice.content,
            authorName: notice.authorName,
            status: notice.status,
            isPinned: notice.isPinned,
            viewCount: notice.viewCount || 0,
            publishedAt: notice.publishedAt?.toISOString(),
            expiredAt: notice.expiredAt?.toISOString(),
            createdAt: notice.createdAt.toISOString(),
            updatedAt: notice.updatedAt.toISOString(),
        };
    }
}
