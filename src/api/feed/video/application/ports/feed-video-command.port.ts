import { VideoStatus } from '../../../../../schema/video.schema';

export interface FeedVideoCommandSnapshot {
    id: string;
    uploadedById: string;
    title: string;
    status: VideoStatus;
    originalKey: string;
    thumbnailKey?: string;
    duration: number;
    viewCount: number;
    isPublic: boolean;
    createdAt: Date;
    failureReason?: string;
}

export const FEED_VIDEO_COMMAND = Symbol('FEED_VIDEO_COMMAND');

export interface FeedVideoCommandPort {
    createPendingVideo(data: {
        userId: string;
        uploaderModel: 'Breeder' | 'Adopter';
        title: string;
        description?: string;
        tags: string[];
        originalKey: string;
    }): Promise<{ videoId: string }>;
    findById(videoId: string): Promise<FeedVideoCommandSnapshot | null>;
    markAsProcessing(videoId: string): Promise<void>;
    readMine(userId: string, skip: number, limit: number): Promise<FeedVideoCommandSnapshot[]>;
    countMine(userId: string): Promise<number>;
    deleteById(videoId: string): Promise<void>;
    updateVisibility(videoId: string, isPublic: boolean): Promise<void>;
}
