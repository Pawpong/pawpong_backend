import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Video, VideoDocument, VideoStatus } from '../../../../schema/video.schema';
import type { FeedVideoDocumentRecord } from '../../types/feed-document.type';

@Injectable()
export class FeedTagRepository {
    constructor(@InjectModel(Video.name) private readonly videoModel: Model<VideoDocument>) {}

    findReadyPublicByExactTag(tagPattern: RegExp, skip: number, limit: number): Promise<FeedVideoDocumentRecord[]> {
        return this.videoModel
            .find({
                tags: { $regex: tagPattern },
                status: VideoStatus.READY,
                isPublic: true,
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('uploadedBy', 'name profileImageFileName businessName')
            .lean()
            .exec() as Promise<FeedVideoDocumentRecord[]>;
    }

    countReadyPublicByExactTag(tagPattern: RegExp): Promise<number> {
        return this.videoModel
            .countDocuments({
                tags: { $regex: tagPattern },
                status: VideoStatus.READY,
                isPublic: true,
            })
            .exec();
    }

    aggregatePopularTags(limit: number) {
        return this.videoModel.aggregate([
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
    }

    aggregateTagSuggestions(queryPattern: RegExp, limit: number) {
        return this.videoModel.aggregate([
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
    }
}
