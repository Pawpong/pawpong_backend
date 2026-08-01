export type AnnouncementCreateCommand = {
    title: string;
    content: string;
    isActive?: boolean;
    order?: number;
};

export type AnnouncementUpdateCommand = {
    title?: string;
    content?: string;
    isActive?: boolean;
    order?: number;
};
