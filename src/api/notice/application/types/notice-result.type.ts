import type { PageResult } from '../../../../common/types/page-result.type';

export type NoticeItemResult = {
    noticeId: string;
    title: string;
    content: string;
    authorName: string;
    status: 'published' | 'draft' | 'archived';
    isPinned: boolean;
    viewCount: number;
    publishedAt?: string;
    expiredAt?: string;
    createdAt: string;
    updatedAt: string;
};

export type NoticePageResult = PageResult<NoticeItemResult>;
