import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Video, VideoStatus } from '../../../schema/video.schema.js';
import { VideoLike } from '../../../schema/video-like.schema.js';
import { StorageService } from '../../../common/storage/storage.service.js';

/**
 * 피드 좋아요 서비스
 * - 좋아요 토글
 * - 좋아요 상태 확인
 * - 좋아요한 동영상 목록
 */
@Injectable()
export class FeedLikeService {
    private readonly logger = new Logger(FeedLikeService.name);

    constructor(
        @InjectModel(Video.name) private videoModel: Model<Video>,
        @InjectModel(VideoLike.name) private videoLikeModel: Model<VideoLike>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private storageService: StorageService,
    ) {}

    /**
     * 좋아요 토글 (좋아요/좋아요 취소)
     */
    async toggleLike(videoId: string, userId: string, userModel: 'Breeder' | 'Adopter') {
        this.logger.log(`[toggleLike] 좋아요 토글 - videoId: ${videoId}, userId: ${userId}`);

        const video = await this.videoModel.findById(videoId);
        if (!video) {
            throw new BadRequestException('동영상을 찾을 수 없습니다.');
        }

        const existingLike = await this.videoLikeModel.findOne({
            videoId: new Types.ObjectId(videoId),
            userId: new Types.ObjectId(userId),
        });

        let isLiked: boolean;

        if (existingLike) {
            // 좋아요 취소
            await this.videoLikeModel.deleteOne({ _id: existingLike._id });
            await this.videoModel.updateOne({ _id: videoId }, { $inc: { likeCount: -1 } });
            isLiked = false;
            this.logger.log(`[toggleLike] 좋아요 취소 - videoId: ${videoId}`);
        } else {
            // 좋아요 추가
            await this.videoLikeModel.create({
                videoId: new Types.ObjectId(videoId),
                userId: new Types.ObjectId(userId),
                userModel,
            });
            await this.videoModel.updateOne({ _id: videoId }, { $inc: { likeCount: 1 } });
            isLiked = true;
            this.logger.log(`[toggleLike] 좋아요 추가 - videoId: ${videoId}`);
        }

        // 캐시 무효화
        await this.cacheManager.del(`video:meta:${videoId}`);

        const updatedVideo = await this.videoModel.findById(videoId).lean();

        return {
            isLiked,
            likeCount: updatedVideo?.likeCount || 0,
        };
    }

    /**
     * 좋아요 상태 확인
     */
    async getLikeStatus(videoId: string, userId: string) {
        const like = await this.videoLikeModel.findOne({
            videoId: new Types.ObjectId(videoId),
            userId: new Types.ObjectId(userId),
        });

        const video = await this.videoModel.findById(videoId).lean();

        return {
            isLiked: !!like,
            likeCount: video?.likeCount || 0,
        };
    }

    /**
     * 내가 좋아요한 동영상 목록
     */
    async getMyLikedVideos(userId: string, page: number = 1, limit: number = 20) {
        this.logger.log(`[getMyLikedVideos] 좋아요한 동영상 조회 - userId: ${userId}`);

        const skip = (page - 1) * limit;

        const [likes, totalCount] = await Promise.all([
            this.videoLikeModel
                .find({ userId: new Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.videoLikeModel.countDocuments({ userId: new Types.ObjectId(userId) }),
        ]);

        const videoIds = likes.map((like) => like.videoId);

        const videos = await this.videoModel
            .find({
                _id: { $in: videoIds },
                status: VideoStatus.READY,
            })
            .populate('uploadedBy', 'name profileImageFileName businessName')
            .lean();

        const videosWithUrls = await Promise.all(
            videos.map(async (video) => ({
                videoId: video._id,
                title: video.title,
                thumbnailUrl: video.thumbnailKey ? this.storageService.generateSignedUrl(video.thumbnailKey, 50) : null,
                duration: video.duration,
                viewCount: video.viewCount,
                likeCount: video.likeCount,
                uploadedBy: video.uploadedBy,
                createdAt: video.createdAt,
            })),
        );

        return {
            videos: videosWithUrls,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1,
            },
        };
    }
}
