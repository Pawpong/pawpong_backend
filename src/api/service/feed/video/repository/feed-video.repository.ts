import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Video, VideoDocument } from '../../../../../schema/video.schema';
import { VideoStatus } from '../../../../../common/enum/video-status.enum';
import { FeedVideoEncodingResult } from '../application/ports/feed-video-command.port';
import type { FeedVideoDocumentRecord } from '../../types/feed-document.type';
import { eligibleAppAuthorIds, isIosAppRequest } from '../../../../../common/content-rights/app-request-context';

@Injectable()
export class FeedVideoRepository {
    constructor(@InjectModel(Video.name) private readonly videoModel: Model<VideoDocument>) {}

    async findPublicFeed(skip: number, limit: number): Promise<FeedVideoDocumentRecord[]> {
        return this.videoModel
            .find({ status: VideoStatus.READY, isPublic: true, ...await this.appUploaderFilter() })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('uploadedBy', 'name profileImageFileName businessName')
            .lean()
            .exec() as Promise<FeedVideoDocumentRecord[]>;
    }

    async countPublicFeed(): Promise<number> {
        return this.videoModel.countDocuments({ status: VideoStatus.READY, isPublic: true, ...await this.appUploaderFilter() }).exec();
    }

    async findPopular(limit: number): Promise<FeedVideoDocumentRecord[]> {
        return this.videoModel
            .find({ status: VideoStatus.READY, isPublic: true, ...await this.appUploaderFilter() })
            .sort({ viewCount: -1 })
            .limit(limit)
            .populate('uploadedBy', 'name profileImageFileName businessName')
            .lean()
            .exec() as Promise<FeedVideoDocumentRecord[]>;
    }

    async findByIdWithUploader(videoId: string): Promise<FeedVideoDocumentRecord | null> {
        return this.videoModel
            .findOne({ _id: videoId, ...await this.appUploaderFilter() })
            .populate('uploadedBy', 'name profileImageFileName businessName')
            .lean()
            .exec() as Promise<FeedVideoDocumentRecord | null>;
    }

    async createPendingVideo(data: {
        userId: string;
        uploaderModel: 'Breeder' | 'Adopter';
        title: string;
        description?: string;
        tags: string[];
        originalKey: string;
    }): Promise<{ videoId: string }> {
        const video = await this.videoModel.create({
            uploadedBy: new Types.ObjectId(data.userId),
            uploaderModel: data.uploaderModel,
            title: data.title,
            description: data.description,
            tags: data.tags,
            status: VideoStatus.PENDING,
            originalKey: data.originalKey,
        });

        return { videoId: video.id as string };
    }

    async findById(videoId: string): Promise<FeedVideoDocumentRecord | null> {
        return this.videoModel.findOne({ _id: videoId, ...await this.appUploaderFilter() }).lean().exec() as Promise<FeedVideoDocumentRecord | null>;
    }

    async markAsProcessing(videoId: string): Promise<void> {
        await this.videoModel.updateOne({ _id: videoId }, { status: VideoStatus.PROCESSING }).exec();
    }

    findMine(userId: string, skip: number, limit: number): Promise<FeedVideoDocumentRecord[]> {
        return this.videoModel
            .find({ uploadedBy: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec() as Promise<FeedVideoDocumentRecord[]>;
    }

    countMine(userId: string): Promise<number> {
        return this.videoModel.countDocuments({ uploadedBy: new Types.ObjectId(userId) }).exec();
    }

    async deleteById(videoId: string): Promise<void> {
        await this.videoModel.deleteOne({ _id: videoId }).exec();
    }

    async updateVisibility(videoId: string, isPublic: boolean): Promise<void> {
        await this.videoModel.updateOne({ _id: videoId }, { isPublic }).exec();
    }

    async incrementViewCount(videoId: string): Promise<void> {
        if (!Types.ObjectId.isValid(videoId)) {
            return;
        }

        await this.videoModel.updateOne({ _id: videoId }, { $inc: { viewCount: 1 } }).exec();
    }

    async markEncodingComplete(videoId: string, data: FeedVideoEncodingResult): Promise<void> {
        if (!Types.ObjectId.isValid(videoId)) {
            return;
        }

        await this.videoModel
            .updateOne(
                { _id: videoId },
                {
                    status: VideoStatus.READY,
                    hlsManifestKey: data.hlsManifestKey,
                    thumbnailKey: data.thumbnailKey,
                    duration: data.duration,
                    width: data.width,
                    height: data.height,
                },
            )
            .exec();
    }

    async markEncodingFailed(videoId: string, reason: string): Promise<void> {
        if (!Types.ObjectId.isValid(videoId)) {
            return;
        }

        await this.videoModel
            .updateOne(
                { _id: videoId },
                {
                    status: VideoStatus.FAILED,
                    failureReason: reason,
                },
            )
            .exec();
    }

    private async appUploaderFilter(): Promise<{ uploadedBy?: { $in: Types.ObjectId[] } }> {
        if (!isIosAppRequest()) return {};
        return { uploadedBy: { $in: await eligibleAppAuthorIds(this.videoModel.db) } };
    }
}
