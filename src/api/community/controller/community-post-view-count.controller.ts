import { Param, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { IncrementViewCountUseCase } from '../application/use-cases/increment-view-count.use-case';
import { COMMUNITY_RESPONSE_MESSAGES } from '../constants/community-response-messages';
import { CommunityPublicController } from '../decorator/community-public-controller.decorator';
import { ApiIncrementViewCountEndpoint } from '../swagger';

/**
 * v2 커뮤니티 게시글 조회 수 — 상세 진입 시 호출 (Figma 315:5433).
 */
@CommunityPublicController()
export class CommunityPostViewCountController {
    constructor(private readonly incrementViewCountUseCase: IncrementViewCountUseCase) {}

    @Post('posts/:postId/view')
    @ApiIncrementViewCountEndpoint()
    async view(
        @Param('postId') postId: string,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<null>> {
        await this.incrementViewCountUseCase.execute(postId, userId);
        return ApiResponseDto.success(null, COMMUNITY_RESPONSE_MESSAGES.viewCounted);
    }
}
