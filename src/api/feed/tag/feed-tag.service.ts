import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Video, VideoStatus } from '../../../schema/video.schema.js';
import { StorageService } from '../../../common/storage/storage.service.js';

/**
 * 피드 태그 서비스
 * - 해시태그 검색
 * - 인기 태그 조회
 * - 태그 자동완성
 */
@Injectable()
export class FeedTagService {
    private readonly logger = new Logger(FeedTagService.name);

    constructor(
        @InjectModel(Video.name) private videoModel: Model<Video>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private storageService: StorageService,
    ) {}

    /**
     * 해시태그로 동영상 검색
     */
    async searchByTag(tag: string, page: number = 1, limit: number = 20) {
        this.logger.log(`[searchByTag] 태그 검색 - tag: ${tag}`);

        // # 제거
        const cleanTag = tag.replace(/^#/, '').toLowerCase();

        const cacheKey = `video:tag:${cleanTag}:${page}:${limit}`;

        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }

        const skip = (page - 1) * limit;

        const [videos, totalCount] = await Promise.all([
            this.videoModel
                .find({
                    tags: { $regex: new RegExp(`^${cleanTag}$`, 'i') },
                    status: VideoStatus.READY,
                    isPublic: true,
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('uploadedBy', 'name profileImageFileName businessName')
                .lean(),
            this.videoModel.countDocuments({
                tags: { $regex: new RegExp(`^${cleanTag}$`, 'i') },
                status: VideoStatus.READY,
                isPublic: true,
            }),
        ]);

        const videosWithUrls = await Promise.all(
            videos.map(async (video) => ({
                videoId: video._id,
                title: video.title,
                thumbnailUrl: video.thumbnailKey ? this.storageService.generateSignedUrl(video.thumbnailKey, 50) : null,
                duration: video.duration,
                viewCount: video.viewCount,
                likeCount: video.likeCount,
                tags: video.tags,
                uploadedBy: video.uploadedBy,
                createdAt: video.createdAt,
            })),
        );

        const result = {
            videos: videosWithUrls,
            tag: cleanTag,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1,
            },
        };

        // 5분 캐싱
        await this.cacheManager.set(cacheKey, result, 300000);

        return result;
    }

    /**
     * 인기 해시태그 목록
     */
    async getPopularTags(limit: number = 20) {
        this.logger.log(`[getPopularTags] 인기 태그 조회`);

        const cacheKey = `video:popular-tags:${limit}`;

        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }

        // 태그별 동영상 수 집계
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

        // 10분 캐싱
        await this.cacheManager.set(cacheKey, popularTags, 600000);

        return popularTags;
    }

    /**
     * 태그 자동완성 (검색창)
     */
    async suggestTags(query: string, limit: number = 10) {
        this.logger.log(`[suggestTags] 태그 자동완성 - query: ${query}`);

        const cleanQuery = query.replace(/^#/, '').toLowerCase();

        if (cleanQuery.length < 1) {
            return [];
        }

        const suggestions = await this.videoModel.aggregate([
            {
                $match: {
                    status: VideoStatus.READY,
                    isPublic: true,
                    tags: { $regex: new RegExp(`^${cleanQuery}`, 'i') },
                },
            },
            { $unwind: '$tags' },
            {
                $match: {
                    tags: { $regex: new RegExp(`^${cleanQuery}`, 'i') },
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

        return suggestions;
    }
}
