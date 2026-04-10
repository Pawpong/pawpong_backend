import type { VideoStatus } from '../../../schema/video.schema';

export type FeedObjectIdLike = {
    toString(): string;
};

export type FeedUploaderDocumentRecord = {
    _id: FeedObjectIdLike;
    name?: string;
    profileImageFileName?: string;
    businessName?: string;
};

export type FeedVideoDocumentRecord = {
    _id: FeedObjectIdLike;
    uploadedBy: FeedObjectIdLike | FeedUploaderDocumentRecord;
    title: string;
    description?: string;
    status: VideoStatus;
    originalKey: string;
    hlsManifestKey?: string;
    thumbnailKey?: string;
    duration: number;
    width?: number;
    height?: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    isPublic: boolean;
    tags?: string[];
    createdAt: Date;
    failureReason?: string;
};

export type FeedCommentDocumentRecord = {
    _id: FeedObjectIdLike;
    videoId: FeedObjectIdLike;
    userId: FeedObjectIdLike | FeedUploaderDocumentRecord;
    content: string;
    parentId?: FeedObjectIdLike;
    likeCount?: number;
    isDeleted?: boolean;
    createdAt: Date;
    updatedAt?: Date;
};
