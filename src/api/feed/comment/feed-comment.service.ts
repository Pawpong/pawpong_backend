import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Video } from '../../../schema/video.schema.js';
import { VideoComment } from '../../../schema/video-comment.schema.js';

/**
 * 피드 댓글 서비스
 * - 댓글 작성/수정/삭제
 * - 대댓글 기능
 */
@Injectable()
export class FeedCommentService {
    private readonly logger = new Logger(FeedCommentService.name);

    constructor(
        @InjectModel(Video.name) private videoModel: Model<Video>,
        @InjectModel(VideoComment.name) private videoCommentModel: Model<VideoComment>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    /**
     * 댓글 작성
     */
    async createComment(
        videoId: string,
        userId: string,
        userModel: 'Breeder' | 'Adopter',
        content: string,
        parentId?: string,
    ) {
        this.logger.log(`[createComment] 댓글 작성 - videoId: ${videoId}, userId: ${userId}`);

        const video = await this.videoModel.findById(videoId);
        if (!video) {
            throw new BadRequestException('동영상을 찾을 수 없습니다.');
        }

        // 부모 댓글 확인 (대댓글인 경우)
        if (parentId) {
            const parentComment = await this.videoCommentModel.findById(parentId);
            if (!parentComment || parentComment.videoId.toString() !== videoId) {
                throw new BadRequestException('부모 댓글을 찾을 수 없습니다.');
            }
        }

        const comment = await this.videoCommentModel.create({
            videoId: new Types.ObjectId(videoId),
            userId: new Types.ObjectId(userId),
            userModel,
            content,
            parentId: parentId ? new Types.ObjectId(parentId) : undefined,
        });

        // 동영상 댓글 수 증가
        await this.videoModel.updateOne({ _id: videoId }, { $inc: { commentCount: 1 } });

        // 캐시 무효화
        await this.cacheManager.del(`video:meta:${videoId}`);
        await this.cacheManager.del(`video:comments:${videoId}`);

        this.logger.log(`[createComment] 댓글 작성 완료 - commentId: ${comment.id}`);

        return {
            commentId: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
        };
    }

    /**
     * 댓글 목록 조회
     */
    async getComments(videoId: string, userId?: string, page: number = 1, limit: number = 20) {
        this.logger.log(`[getComments] 댓글 조회 - videoId: ${videoId}`);

        const skip = (page - 1) * limit;

        // 최상위 댓글만 조회 (parentId가 없는 것)
        const [comments, totalCount] = await Promise.all([
            this.videoCommentModel
                .find({
                    videoId: new Types.ObjectId(videoId),
                    parentId: { $exists: false },
                    isDeleted: false,
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name profileImageFileName businessName')
                .lean(),
            this.videoCommentModel.countDocuments({
                videoId: new Types.ObjectId(videoId),
                parentId: { $exists: false },
                isDeleted: false,
            }),
        ]);

        // 대댓글 수 조회
        const commentIds = comments.map((c) => c._id);
        const replyCounts = await this.videoCommentModel.aggregate([
            {
                $match: {
                    parentId: { $in: commentIds },
                    isDeleted: false,
                },
            },
            {
                $group: {
                    _id: '$parentId',
                    count: { $sum: 1 },
                },
            },
        ]);

        const replyCountMap = new Map(replyCounts.map((r) => [r._id.toString(), r.count]));

        const result = comments.map((comment) => ({
            commentId: comment._id,
            content: comment.content,
            author: comment.userId,
            likeCount: comment.likeCount,
            replyCount: replyCountMap.get(comment._id.toString()) || 0,
            createdAt: comment.createdAt,
            isOwner: userId ? comment.userId?._id?.toString() === userId : false,
        }));

        return {
            comments: result,
            totalCount,
            hasNextPage: page < Math.ceil(totalCount / limit),
        };
    }

    /**
     * 대댓글 조회
     */
    async getReplies(commentId: string, userId?: string, page: number = 1, limit: number = 20) {
        this.logger.log(`[getReplies] 대댓글 조회 - commentId: ${commentId}`);

        const skip = (page - 1) * limit;

        const [replies, totalCount] = await Promise.all([
            this.videoCommentModel
                .find({
                    parentId: new Types.ObjectId(commentId),
                    isDeleted: false,
                })
                .sort({ createdAt: 1 }) // 대댓글은 오래된 순
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name profileImageFileName businessName')
                .lean(),
            this.videoCommentModel.countDocuments({
                parentId: new Types.ObjectId(commentId),
                isDeleted: false,
            }),
        ]);

        const result = replies.map((reply) => ({
            commentId: reply._id,
            content: reply.content,
            author: reply.userId,
            likeCount: reply.likeCount,
            createdAt: reply.createdAt,
            isOwner: userId ? reply.userId?._id?.toString() === userId : false,
        }));

        return {
            replies: result,
            totalCount,
            hasNextPage: page < Math.ceil(totalCount / limit),
        };
    }

    /**
     * 댓글 수정
     */
    async updateComment(commentId: string, userId: string, content: string) {
        this.logger.log(`[updateComment] 댓글 수정 - commentId: ${commentId}`);

        const comment = await this.videoCommentModel.findById(commentId);

        if (!comment) {
            throw new BadRequestException('댓글을 찾을 수 없습니다.');
        }

        if (comment.userId.toString() !== userId) {
            throw new BadRequestException('권한이 없습니다.');
        }

        comment.content = content;
        await comment.save();

        return {
            commentId: comment.id,
            content: comment.content,
            updatedAt: comment.updatedAt,
        };
    }

    /**
     * 댓글 삭제 (soft delete)
     */
    async deleteComment(commentId: string, userId: string) {
        this.logger.log(`[deleteComment] 댓글 삭제 - commentId: ${commentId}`);

        const comment = await this.videoCommentModel.findById(commentId);

        if (!comment) {
            throw new BadRequestException('댓글을 찾을 수 없습니다.');
        }

        if (comment.userId.toString() !== userId) {
            throw new BadRequestException('권한이 없습니다.');
        }

        // soft delete
        comment.isDeleted = true;
        await comment.save();

        // 동영상 댓글 수 감소
        await this.videoModel.updateOne({ _id: comment.videoId }, { $inc: { commentCount: -1 } });

        // 캐시 무효화
        await this.cacheManager.del(`video:meta:${comment.videoId}`);
        await this.cacheManager.del(`video:comments:${comment.videoId}`);

        return { success: true };
    }
}
