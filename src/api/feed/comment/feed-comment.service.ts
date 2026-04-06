import { Injectable, Logger } from '@nestjs/common';

import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { GetCommentsUseCase } from './application/use-cases/get-comments.use-case';
import { GetRepliesUseCase } from './application/use-cases/get-replies.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';

/**
 * 피드 댓글 서비스
 * - 댓글 작성/수정/삭제
 * - 대댓글 기능
 */
@Injectable()
export class FeedCommentService {
    private readonly logger = new Logger(FeedCommentService.name);

    constructor(
        private readonly createCommentUseCase: CreateCommentUseCase,
        private readonly getCommentsUseCase: GetCommentsUseCase,
        private readonly getRepliesUseCase: GetRepliesUseCase,
        private readonly updateCommentUseCase: UpdateCommentUseCase,
        private readonly deleteCommentUseCase: DeleteCommentUseCase,
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
        const result = await this.createCommentUseCase.execute(videoId, userId, userModel, content, parentId);
        this.logger.log(`[createComment] 댓글 작성 완료 - commentId: ${result.commentId}`);
        return result;
    }

    /**
     * 댓글 목록 조회
     */
    async getComments(videoId: string, userId?: string, page: number = 1, limit: number = 20) {
        this.logger.log(`[getComments] 댓글 조회 - videoId: ${videoId}`);
        return this.getCommentsUseCase.execute(videoId, userId, page, limit);
    }

    /**
     * 대댓글 조회
     */
    async getReplies(commentId: string, userId?: string, page: number = 1, limit: number = 20) {
        this.logger.log(`[getReplies] 대댓글 조회 - commentId: ${commentId}`);
        return this.getRepliesUseCase.execute(commentId, userId, page, limit);
    }

    /**
     * 댓글 수정
     */
    async updateComment(commentId: string, userId: string, content: string) {
        this.logger.log(`[updateComment] 댓글 수정 - commentId: ${commentId}`);
        return this.updateCommentUseCase.execute(commentId, userId, content);
    }

    /**
     * 댓글 삭제 (soft delete)
     */
    async deleteComment(commentId: string, userId: string) {
        this.logger.log(`[deleteComment] 댓글 삭제 - commentId: ${commentId}`);
        return this.deleteCommentUseCase.execute(commentId, userId);
    }
}
