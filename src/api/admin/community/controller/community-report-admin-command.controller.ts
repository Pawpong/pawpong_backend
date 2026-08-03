import { CurrentUser } from '../../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { HandleCommunityPostReportUseCase } from '../application/use-cases/handle-community-post-report.use-case';
import { CommunityAdminController } from '../decorator/community-admin-controller.decorator';
import { CommunityReportAdminActionResponseDto } from '../dto/response/community-report-admin-response.dto';
import { HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiEndpoint } from '../../../../common/decorator/swagger.decorator';

/**
 * 커뮤니티 신고 처리 — 관리자 전용.
 */
@CommunityAdminController()
export class CommunityReportAdminCommandController {
    constructor(private readonly handleReportUseCase: HandleCommunityPostReportUseCase) {}

    @Post('reports/:reportId/resolve')
    @HttpCode(HttpStatus.OK)
    @ApiEndpoint({
        summary: '커뮤니티 신고 처리 (숨김)',
        description: '신고된 게시글을 숨김(isActive=false) 처리하고 신고 상태를 resolved 로 변경한다.',
        responseType: CommunityReportAdminActionResponseDto,
        successDescription: '신고 처리 성공',
        successMessageExample: '신고가 처리되었습니다.',
        errorResponses: [
            { status: 400, description: '신고 없음 또는 이미 처리됨', errorExample: '해당 신고를 찾을 수 없습니다.' },
        ],
    })
    async resolve(
        @Param('reportId') reportId: string,
        @CurrentUser('userId') adminId: string,
    ): Promise<ApiResponseDto<CommunityReportAdminActionResponseDto>> {
        const result = await this.handleReportUseCase.execute(reportId, adminId, 'resolve');
        return ApiResponseDto.success(result, '신고가 처리되었습니다.');
    }

    @Post('reports/:reportId/dismiss')
    @HttpCode(HttpStatus.OK)
    @ApiEndpoint({
        summary: '커뮤니티 신고 기각',
        description: '신고를 기각(dismissed) 처리한다. 게시글은 그대로 유지.',
        responseType: CommunityReportAdminActionResponseDto,
        successDescription: '신고 기각 성공',
        successMessageExample: '신고가 기각되었습니다.',
        errorResponses: [
            { status: 400, description: '신고 없음 또는 이미 처리됨', errorExample: '이미 처리된 신고입니다.' },
        ],
    })
    async dismiss(
        @Param('reportId') reportId: string,
        @CurrentUser('userId') adminId: string,
    ): Promise<ApiResponseDto<CommunityReportAdminActionResponseDto>> {
        const result = await this.handleReportUseCase.execute(reportId, adminId, 'dismiss');
        return ApiResponseDto.success(result, '신고가 기각되었습니다.');
    }
}
