import { VideoStatus } from '../../../../../common/enum/video-status.enum';

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

export interface FeedVideoEncodingResult {
    hlsManifestKey: string;
    thumbnailKey: string;
    duration: number;
    width: number;
    height: number;
}

export const FEED_VIDEO_COMMAND_PORT = Symbol('FEED_VIDEO_COMMAND_PORT');

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
    incrementViewCount(videoId: string): Promise<void>;
    markEncodingComplete(videoId: string, data: FeedVideoEncodingResult): Promise<void>;
    markEncodingFailed(videoId: string, reason: string): Promise<void>;
}
