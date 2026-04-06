import { Injectable, Logger } from '@nestjs/common';

import { ToggleLikeUseCase } from './application/use-cases/toggle-like.use-case';
import { GetLikeStatusUseCase } from './application/use-cases/get-like-status.use-case';
import { GetMyLikedVideosUseCase } from './application/use-cases/get-my-liked-videos.use-case';

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
        private readonly toggleLikeUseCase: ToggleLikeUseCase,
        private readonly getLikeStatusUseCase: GetLikeStatusUseCase,
        private readonly getMyLikedVideosUseCase: GetMyLikedVideosUseCase,
    ) {}

    /**
     * 좋아요 토글 (좋아요/좋아요 취소)
     */
    async toggleLike(videoId: string, userId: string, userModel: 'Breeder' | 'Adopter') {
        this.logger.log(`[toggleLike] 좋아요 토글 - videoId: ${videoId}, userId: ${userId}`);
        return this.toggleLikeUseCase.execute(videoId, userId, userModel);
    }

    /**
     * 좋아요 상태 확인
     */
    async getLikeStatus(videoId: string, userId: string) {
        return this.getLikeStatusUseCase.execute(videoId, userId);
    }

    /**
     * 내가 좋아요한 동영상 목록
     */
    async getMyLikedVideos(userId: string, page: number = 1, limit: number = 20) {
        this.logger.log(`[getMyLikedVideos] 좋아요한 동영상 조회 - userId: ${userId}`);
        return this.getMyLikedVideosUseCase.execute(userId, page, limit);
    }
}
