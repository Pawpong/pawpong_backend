import { Delete, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { LikeCommunityPostUseCase } from '../application/use-cases/like-community-post.use-case';
import { UnlikeCommunityPostUseCase } from '../application/use-cases/unlike-community-post.use-case';
import { COMMUNITY_RESPONSE_MESSAGES } from '../constants/community-response-messages';
import { CommunityProtectedController } from '../decorator/community-protected-controller.decorator';
import type { CommunityLikeResponseDto, CommunityUnlikeResponseDto } from '../dto/response/community-like-response.dto';
import { ApiLikeCommunityPostEndpoint, ApiUnlikeCommunityPostEndpoint } from '../swagger';

/**
 * v2 커뮤니티 게시글 좋아요 (Figma 315:5433).
 */
@CommunityProtectedController()
export class CommunityPostLikeController {
    constructor(
        private readonly likeUseCase: LikeCommunityPostUseCase,
        private readonly unlikeUseCase: UnlikeCommunityPostUseCase,
    ) {}

    @Post('posts/:postId/like')
    @ApiLikeCommunityPostEndpoint()
    async like(
        @Param('postId') postId: string,
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: 'adopter' | 'breeder',
    ): Promise<ApiResponseDto<CommunityLikeResponseDto>> {
        const userModel = role === 'breeder' ? 'Breeder' : 'Adopter';
        const result = await this.likeUseCase.execute(postId, userId, userModel);
        return ApiResponseDto.success(result, COMMUNITY_RESPONSE_MESSAGES.liked);
    }

    @Delete('posts/:postId/like')
    @ApiUnlikeCommunityPostEndpoint()
    async unlike(
        @Param('postId') postId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<CommunityUnlikeResponseDto>> {
        const result = await this.unlikeUseCase.execute(postId, userId);
        return ApiResponseDto.success(result, COMMUNITY_RESPONSE_MESSAGES.unliked);
    }
}
