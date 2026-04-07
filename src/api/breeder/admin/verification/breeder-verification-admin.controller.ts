import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../../common/decorator/user.decorator';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { BreederSearchRequestDto } from './dto/request/breeder-search-request.dto';
import { BreederLevelChangeRequestDto } from './dto/request/breeder-level-change-request.dto';
import { BreederVerificationRequestDto } from './dto/request/breeder-verification-request.dto';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { BreederStatsResponseDto } from './dto/response/breeder-stats-response.dto';
import { BreederDetailResponseDto } from './dto/response/breeder-detail-response.dto';
import { BreederLevelChangeResponseDto } from './dto/response/breeder-level-change-response.dto';
import { BreederVerificationResponseDto } from './dto/response/breeder-verification-response.dto';
import { ChangeBreederLevelUseCase } from './application/use-cases/change-breeder-level.use-case';
import { GetBreederDetailUseCase } from './application/use-cases/get-breeder-detail.use-case';
import { GetBreederStatsUseCase } from './application/use-cases/get-breeder-stats.use-case';
import { GetBreedersUseCase } from './application/use-cases/get-breeders.use-case';
import { GetLevelChangeRequestsUseCase } from './application/use-cases/get-level-change-requests.use-case';
import { GetPendingBreederVerificationsUseCase } from './application/use-cases/get-pending-breeder-verifications.use-case';
import { SendDocumentRemindersUseCase } from './application/use-cases/send-document-reminders.use-case';
import { UpdateBreederVerificationUseCase } from './application/use-cases/update-breeder-verification.use-case';
import {
    ApiBreederVerificationAdminController,
    ApiChangeBreederLevelAdminEndpoint,
    ApiGetBreederDetailAdminEndpoint,
    ApiGetBreederStatsAdminEndpoint,
    ApiGetBreedersAdminEndpoint,
    ApiGetLevelChangeRequestsAdminEndpoint,
    ApiGetPendingBreederVerificationsAdminEndpoint,
    ApiSendDocumentRemindersAdminEndpoint,
    ApiUpdateBreederVerificationAdminEndpoint,
} from './swagger';

/**
 * 브리더 인증 관리 Admin 컨트롤러
 *
 * 브리더 인증 승인/거절 기능을 제공합니다.
 */
@ApiBreederVerificationAdminController()
@Controller('breeder-verification-admin')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BreederVerificationAdminController {
    constructor(
        private readonly getLevelChangeRequestsUseCase: GetLevelChangeRequestsUseCase,
        private readonly getPendingBreederVerificationsUseCase: GetPendingBreederVerificationsUseCase,
        private readonly getBreedersUseCase: GetBreedersUseCase,
        private readonly updateBreederVerificationUseCase: UpdateBreederVerificationUseCase,
        private readonly getBreederDetailUseCase: GetBreederDetailUseCase,
        private readonly getBreederStatsUseCase: GetBreederStatsUseCase,
        private readonly sendDocumentRemindersUseCase: SendDocumentRemindersUseCase,
        private readonly changeBreederLevelUseCase: ChangeBreederLevelUseCase,
    ) {}

    @Get('breeders')
    @ApiGetBreedersAdminEndpoint()
    async getBreeders(
        @CurrentUser('userId') adminId: string,
        @Query() filter: BreederSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederVerificationResponseDto>>> {
        const result = await this.getBreedersUseCase.execute(adminId, filter);
        return ApiResponseDto.success(result, '브리더 목록이 조회되었습니다.');
    }

    @Get('verification/pending')
    @ApiGetPendingBreederVerificationsAdminEndpoint()
    async getPendingBreederVerifications(
        @CurrentUser('userId') adminId: string,
        @Query() filter: BreederSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederVerificationResponseDto>>> {
        const result = await this.getPendingBreederVerificationsUseCase.execute(adminId, filter);
        return ApiResponseDto.success(result, '승인 대기 브리더 목록이 조회되었습니다.');
    }

    @Get('verification/level-change-requests')
    @ApiGetLevelChangeRequestsAdminEndpoint()
    async getLevelChangeRequests(
        @CurrentUser('userId') adminId: string,
        @Query() filter: BreederSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederVerificationResponseDto>>> {
        const result = await this.getLevelChangeRequestsUseCase.execute(adminId, filter);
        return ApiResponseDto.success(result, '레벨 변경 신청 목록이 조회되었습니다.');
    }

    @Get('verification/:breederId')
    @ApiGetBreederDetailAdminEndpoint()
    async getBreederDetail(
        @CurrentUser('userId') adminId: string,
        @Param('breederId') breederId: string,
    ): Promise<ApiResponseDto<BreederDetailResponseDto>> {
        const result = await this.getBreederDetailUseCase.execute(adminId, breederId);
        return ApiResponseDto.success(result, '브리더 상세 정보가 조회되었습니다.');
    }

    @Patch('verification/:breederId')
    @ApiUpdateBreederVerificationAdminEndpoint()
    async updateBreederVerification(
        @CurrentUser('userId') adminId: string,
        @Param('breederId') breederId: string,
        @Body() verificationData: BreederVerificationRequestDto,
    ): Promise<ApiResponseDto<{ message: string }>> {
        const result = await this.updateBreederVerificationUseCase.execute(adminId, breederId, verificationData);
        return ApiResponseDto.success(result, '브리더 인증 처리가 완료되었습니다.');
    }

    @Get('stats')
    @ApiGetBreederStatsAdminEndpoint()
    async getBreederStats(@CurrentUser('userId') adminId: string): Promise<ApiResponseDto<BreederStatsResponseDto>> {
        const result = await this.getBreederStatsUseCase.execute(adminId);
        return ApiResponseDto.success(result, '브리더 통계가 조회되었습니다.');
    }

    @Post('document-reminders/send')
    @ApiSendDocumentRemindersAdminEndpoint()
    async sendDocumentReminders(
        @CurrentUser('userId') adminId: string,
    ): Promise<ApiResponseDto<{ sentCount: number; breederIds: string[] }>> {
        const result = await this.sendDocumentRemindersUseCase.execute(adminId);
        return ApiResponseDto.success(result, `${result.sentCount}명의 브리더에게 서류 독촉 이메일이 발송되었습니다.`);
    }

    @Patch('level/:breederId')
    @ApiChangeBreederLevelAdminEndpoint()
    async changeBreederLevel(
        @CurrentUser('userId') adminId: string,
        @Param('breederId') breederId: string,
        @Body() levelData: BreederLevelChangeRequestDto,
    ): Promise<ApiResponseDto<BreederLevelChangeResponseDto>> {
        const result = await this.changeBreederLevelUseCase.execute(adminId, breederId, levelData);
        return ApiResponseDto.success(result, '브리더 레벨이 변경되었습니다.');
    }
}
