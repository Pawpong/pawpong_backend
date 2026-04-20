export type AnnouncementPublicItem = {
    announcementId: string;
    title: string;
    content: string;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
};

export type AnnouncementPublicListQuery = {
    page: number;
    limit: number;
};

export type AnnouncementPublicListResult = {
    items: AnnouncementPublicItem[];
    totalCount: number;
    page: number;
    limit: number;
};

export const ANNOUNCEMENT_PUBLIC_READER_PORT = Symbol('ANNOUNCEMENT_PUBLIC_READER_PORT');

export interface AnnouncementPublicReaderPort {
    findActiveAnnouncements(query: AnnouncementPublicListQuery): Promise<AnnouncementPublicListResult>;
    findActiveAnnouncementById(announcementId: string): Promise<AnnouncementPublicItem | null>;
}
