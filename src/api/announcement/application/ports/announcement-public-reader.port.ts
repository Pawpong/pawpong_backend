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

export abstract class AnnouncementPublicReaderPort {
    abstract findActiveAnnouncements(query: AnnouncementPublicListQuery): Promise<AnnouncementPublicListResult>;
    abstract findActiveAnnouncementById(announcementId: string): Promise<AnnouncementPublicItem | null>;
}
