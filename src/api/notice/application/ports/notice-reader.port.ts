export type NoticeStatus = 'published' | 'draft' | 'archived';

export interface NoticeSnapshot {
    id: string;
    title: string;
    content: string;
    authorName: string;
    status: NoticeStatus;
    isPinned: boolean;
    viewCount: number;
    publishedAt?: Date | null;
    expiredAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export const NOTICE_READER = Symbol('NOTICE_READER');

export interface NoticeReaderPort {
    countByStatus(status?: NoticeStatus): Promise<number>;
    readPage(skip: number, limit: number, status?: NoticeStatus): Promise<NoticeSnapshot[]>;
    readById(noticeId: string): Promise<NoticeSnapshot | null>;
    incrementViewCount(noticeId: string): Promise<void>;
}
