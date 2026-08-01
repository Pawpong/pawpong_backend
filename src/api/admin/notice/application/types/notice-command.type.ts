export type NoticeCreateCommand = {
    title: string;
    content: string;
    status?: 'published' | 'draft' | 'archived';
    isPinned?: boolean;
    publishedAt?: string;
    expiredAt?: string;
};

export type NoticeUpdateCommand = {
    title?: string;
    content?: string;
    status?: 'published' | 'draft' | 'archived';
    isPinned?: boolean;
    publishedAt?: string;
    expiredAt?: string;
};
