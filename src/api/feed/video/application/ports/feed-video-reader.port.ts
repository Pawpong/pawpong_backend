import { VideoStatus } from '../../../../../schema/video.schema';

export interface FeedVideoUploaderSnapshot {
    id: string;
    name?: string;
    profileImageFileName?: string;
    businessName?: string;
}

export interface FeedVideoSnapshot {
    id: string;
    title: string;
    description?: string;
    status: VideoStatus;
    hlsManifestKey?: string;
    thumbnailKey?: string;
    duration: number;
    width?: number;
    height?: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    tags: string[];
    uploadedBy: FeedVideoUploaderSnapshot | null;
    createdAt: Date;
    failureReason?: string;
}

export const FEED_VIDEO_READER = Symbol('FEED_VIDEO_READER');

export interface FeedVideoReaderPort {
    readPublicFeed(skip: number, limit: number): Promise<FeedVideoSnapshot[]>;
    countPublicFeed(): Promise<number>;
    readPopular(limit: number): Promise<FeedVideoSnapshot[]>;
    readById(videoId: string): Promise<FeedVideoSnapshot | null>;
}
