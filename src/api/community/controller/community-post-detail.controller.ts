import { Get, Param } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetCommunityPostDetailUseCase } from '../application/use-cases/get-community-post-detail.use-case';
import { COMMUNITY_RESPONSE_MESSAGES } from '../constants/community-response-messages';
import { CommunityPublicController } from '../decorator/community-public-controller.decorator';
import type { CommunityPostDetailResponseDto } from '../dto/response/community-post-detail.dto';
import { ApiGetCommunityPostDetailEndpoint } from '../swagger';

/**
 * v2 커뮤니티 게시글 상세 (Figma 315:5433).
 */
@CommunityPublicController()
export class CommunityPostDetailController {
    constructor(private readonly getDetailUseCase: GetCommunityPostDetailUseCase) {}

    @Get('posts/:postId')
    @ApiGetCommunityPostDetailEndpoint()
    async detail(
        @Param('postId') postId: string,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<CommunityPostDetailResponseDto>> {
        const result = await this.getDetailUseCase.execute(postId, userId);
        return ApiResponseDto.success(result, COMMUNITY_RESPONSE_MESSAGES.detailRetrieved);
    }
}
