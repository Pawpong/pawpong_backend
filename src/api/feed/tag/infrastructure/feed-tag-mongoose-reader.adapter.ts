import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Video, VideoStatus } from '../../../../schema/video.schema';
import {
    FeedPopularTagSnapshot,
    FeedTagReaderPort,
    FeedTagSuggestionSnapshot,
    FeedTagVideoSnapshot,
} from '../application/ports/feed-tag-reader.port';

@Injectable()
export class FeedTagMongooseReaderAdapter implements FeedTagReaderPort {
    constructor(@InjectModel(Video.name) private readonly videoModel: Model<Video>) {}

    async readByTag(tag: string, skip: number, limit: number): Promise<FeedTagVideoSnapshot[]> {
        const exactTagPattern = new RegExp(`^${this.escapeRegex(tag)}$`, 'i');
        const videos = await this.videoModel
            .find({
                tags: { $regex: exactTagPattern },
                status: VideoStatus.READY,
                isPublic: true,
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('uploadedBy', 'name profileImageFileName businessName')
            .lean()
            .exec();

        return videos.map((video) => this.toVideoSnapshot(video));
    }

    countByTag(tag: string): Promise<number> {
        const exactTagPattern = new RegExp(`^${this.escapeRegex(tag)}$`, 'i');
        return this.videoModel
            .countDocuments({
                tags: { $regex: exactTagPattern },
                status: VideoStatus.READY,
                isPublic: true,
            })
            .exec();
    }

    async readPopularTags(limit: number): Promise<FeedPopularTagSnapshot[]> {
        const popularTags = await this.videoModel.aggregate([
            {
                $match: {
                    status: VideoStatus.READY,
                    isPublic: true,
                    tags: { $exists: true, $ne: [] },
                },
            },
            { $unwind: '$tags' },
            {
                $group: {
                    _id: { $toLower: '$tags' },
                    count: { $sum: 1 },
                    totalViews: { $sum: '$viewCount' },
                },
            },
            { $sort: { count: -1, totalViews: -1 } },
            { $limit: limit },
            {
                $project: {
                    tag: '$_id',
                    videoCount: '$count',
                    totalViews: 1,
                    _id: 0,
                },
            },
        ]);

        return popularTags.map((tag) => ({
            tag: tag.tag,
            videoCount: tag.videoCount,
            totalViews: tag.totalViews,
        }));
    }

    async suggestTags(query: string, limit: number): Promise<FeedTagSuggestionSnapshot[]> {
        const queryPattern = new RegExp(`^${this.escapeRegex(query)}`, 'i');
        const suggestions = await this.videoModel.aggregate([
            {
                $match: {
                    status: VideoStatus.READY,
                    isPublic: true,
                    tags: { $regex: queryPattern },
                },
            },
            { $unwind: '$tags' },
            {
                $match: {
                    tags: { $regex: queryPattern },
                },
            },
            {
                $group: {
                    _id: { $toLower: '$tags' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: limit },
            {
                $project: {
                    tag: '$_id',
                    videoCount: '$count',
                    _id: 0,
                },
            },
        ]);

        return suggestions.map((tag) => ({
            tag: tag.tag,
            videoCount: tag.videoCount,
        }));
    }

    private toVideoSnapshot(video: any): FeedTagVideoSnapshot {
        return {
            id: video._id.toString(),
            title: video.title,
            thumbnailKey: video.thumbnailKey,
            duration: video.duration,
            viewCount: video.viewCount,
            likeCount: video.likeCount,
            tags: video.tags || [],
            uploadedBy: video.uploadedBy
                ? {
                      id: video.uploadedBy._id.toString(),
                      name: video.uploadedBy.name,
                      profileImageFileName: video.uploadedBy.profileImageFileName,
                      businessName: video.uploadedBy.businessName,
                  }
                : null,
            createdAt: video.createdAt,
        };
    }

    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
