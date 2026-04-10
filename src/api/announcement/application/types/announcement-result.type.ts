import type { PageResult } from '../../../../common/types/page-result.type';

export type AnnouncementResult = {
    announcementId: string;
    title: string;
    content: string;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
};

export type AnnouncementPageResult = PageResult<AnnouncementResult>;
