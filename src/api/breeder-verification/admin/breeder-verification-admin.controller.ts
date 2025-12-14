import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiController, ApiEndpoint } from '../../../common/decorator/swagger.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';

import { BreederVerificationAdminService } from './breeder-verification-admin.service';

import { BreederSearchRequestDto } from './dto/request/breeder-search-request.dto';
import { BreederVerificationRequestDto } from './dto/request/breeder-verification-request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { BreederVerificationResponseDto } from './dto/response/breeder-verification-response.dto';
import { BreederDetailResponseDto } from './dto/response/breeder-detail-response.dto';
import { BreederStatsResponseDto } from './dto/response/breeder-stats-response.dto';

/**
 * 브리더 인증 관리 Admin 컨트롤러
 *
 * 브리더 인증 승인/거절 기능을 제공합니다.
 */
@ApiController('브리더 인증 관리 (Admin)')
@Controller('breeder-verification-admin')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BreederVerificationAdminController {
    constructor(private readonly breederVerificationAdminService: BreederVerificationAdminService) {}

    @Get('breeders')
    @ApiEndpoint({
        summary: '브리더 목록 조회 (통합 검색)',
        description: '전체 브리더 목록을 조회합니다. 상태, 도시, 키워드 필터링을 지원합니다.',
        responseType: BreederVerificationResponseDto,
        isPublic: false,
    })
    async getBreeders(
        @CurrentUser() user: any,
        @Query() filter: BreederSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederVerificationResponseDto>>> {
        const result = await this.breederVerificationAdminService.getBreeders(user.userId, filter);
        return ApiResponseDto.success(result, '브리더 목록이 조회되었습니다.');
    }

    @Get('verification/pending')
    @ApiEndpoint({
        summary: '승인 대기 브리더 목록 조회',
        description: '인증 승인을 대기중인 브리더 목록을 조회합니다.',
        responseType: BreederVerificationResponseDto,
        isPublic: false,
    })
    async getPendingBreederVerifications(
        @CurrentUser() user: any,
        @Query() filter: BreederSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederVerificationResponseDto>>> {
        const result = await this.breederVerificationAdminService.getPendingBreederVerifications(user.userId, filter);
        return ApiResponseDto.success(result, '승인 대기 브리더 목록이 조회되었습니다.');
    }

    @Get('verification/:breederId')
    @ApiEndpoint({
        summary: '브리더 상세 정보 조회',
        description: '특정 브리더의 상세 정보를 조회합니다 (서류, 프로필 포함).',
        responseType: BreederDetailResponseDto,
        isPublic: false,
    })
    async getBreederDetail(
        @CurrentUser() user: any,
        @Param('breederId') breederId: string,
    ): Promise<ApiResponseDto<BreederDetailResponseDto>> {
        const result = await this.breederVerificationAdminService.getBreederDetail(user.userId, breederId);
        return ApiResponseDto.success(result, '브리더 상세 정보가 조회되었습니다.');
    }

    @Patch('verification/:breederId')
    @ApiEndpoint({
        summary: '브리더 인증 승인/거절',
        description: '브리더의 인증 신청을 승인하거나 거절합니다.',
        responseType: Object,
        isPublic: false,
    })
    async updateBreederVerification(
        @CurrentUser() user: any,
        @Param('breederId') breederId: string,
        @Body() verificationData: BreederVerificationRequestDto,
    ): Promise<ApiResponseDto<any>> {
        const result = await this.breederVerificationAdminService.updateBreederVerification(
            user.userId,
            breederId,
            verificationData,
        );
        return ApiResponseDto.success(result, '브리더 인증 처리가 완료되었습니다.');
    }

    @Get('stats')
    @ApiEndpoint({
        summary: '승인된 브리더 통계 조회',
        description: '전체 승인된 브리더의 레벨별 통계를 조회합니다 (전체/엘리트/뉴).',
        responseType: BreederStatsResponseDto,
        isPublic: false,
    })
    async getBreederStats(@CurrentUser() user: any): Promise<ApiResponseDto<BreederStatsResponseDto>> {
        const result = await this.breederVerificationAdminService.getBreederStats(user.userId);
        return ApiResponseDto.success(result, '브리더 통계가 조회되었습니다.');
    }

    @Post('document-reminders/send')
    @ApiEndpoint({
        summary: '서류 미제출 브리더에게 독촉 메일 발송',
        description: '승인 후 4주 경과했지만 서류를 제출하지 않은 브리더들에게 독촉 이메일을 발송합니다. Cloud Run으로 스케줄링하여 사용할 수 있습니다.',
        responseType: Object,
        isPublic: false,
    })
    async sendDocumentReminders(@CurrentUser() user: any): Promise<ApiResponseDto<any>> {
        const result = await this.breederVerificationAdminService.sendDocumentReminders(user.userId);
        return ApiResponseDto.success(
            result,
            `${result.sentCount}명의 브리더에게 서류 독촉 이메일이 발송되었습니다.`,
        );
    }
}
