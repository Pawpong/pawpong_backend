import { Body, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { ReportCommunityPostUseCase } from '../application/use-cases/report-community-post.use-case';
import { COMMUNITY_RESPONSE_MESSAGES } from '../constants/community-response-messages';
import { CommunityProtectedController } from '../decorator/community-protected-controller.decorator';
import { CommunityPostReportRequestDto } from '../dto/request/community-post-report-request.dto';
import type { CommunityPostReportResponseDto } from '../dto/response/community-post-report-response.dto';
import { ApiReportCommunityPostEndpoint } from '../swagger';

/**
 * v2 커뮤니티 게시글 신고 (Figma 315:5433).
 */
@CommunityProtectedController()
export class CommunityPostReportController {
    constructor(private readonly reportUseCase: ReportCommunityPostUseCase) {}

    @Post('posts/:postId/report')
    @ApiReportCommunityPostEndpoint()
    async report(
        @Param('postId') postId: string,
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: 'adopter' | 'breeder',
        @Body() body: CommunityPostReportRequestDto,
    ): Promise<ApiResponseDto<CommunityPostReportResponseDto>> {
        const result = await this.reportUseCase.execute(postId, userId, role, {
            reason: body.reason,
            description: body.description,
        });
        return ApiResponseDto.success(result, COMMUNITY_RESPONSE_MESSAGES.reported);
    }
}
