import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiController, ApiEndpoint } from '../../../common/decorator/swagger.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';

import { BreederAdminService } from './breeder-admin.service';

import { ApplicationMonitoringRequestDto } from './dto/request/application-monitoring-request.dto';
import { BreederSuspendRequestDto } from './dto/request/breeder-suspend-request.dto';
import { BreederRemindRequestDto } from './dto/request/breeder-remind-request.dto';
import { SetTestAccountRequestDto } from './dto/request/set-test-account-request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { ApplicationMonitoringResponseDto } from './dto/response/application-monitoring-response.dto';
import { BreederSuspendResponseDto } from './dto/response/breeder-suspend-response.dto';
import { BreederRemindResponseDto } from './dto/response/breeder-remind-response.dto';
import { SetTestAccountResponseDto } from './dto/response/set-test-account-response.dto';

/**
 * 브리더 관리 Admin 컨트롤러
 *
 * 브리더 도메인에 대한 관리자 전용 API를 제공합니다.
 * 모든 엔드포인트는 admin 권한이 필요합니다.
 *
 * 주요 기능:
 * - 입양 신청 모니터링
 * - 브리더 제재 처리 (향후 breeder-suspend/admin으로 분리 예정)
 * - 리마인드 알림 발송 (향후 breeder-remind/admin으로 분리 예정)
 *
 * 분리된 기능:
 * - 브리더 인증 관리 → BreederVerificationAdminModule (/api/breeder-verification-admin)
 * - 브리더 레벨 변경 → BreederLevelAdminModule (/api/breeder-level-admin)
 */
@ApiController('브리더 관리 (Admin)')
@Controller('breeder-admin')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BreederAdminController {
    constructor(private readonly breederAdminService: BreederAdminService) {}

    @Get('applications')
    @ApiEndpoint({
        summary: '입양 신청 모니터링',
        description: '전체 입양 신청 현황을 모니터링합니다.',
        responseType: ApplicationMonitoringResponseDto,
        isPublic: false,
    })
    async getApplications(
        @CurrentUser() user: any,
        @Query() filter: ApplicationMonitoringRequestDto,
    ): Promise<ApiResponseDto<ApplicationMonitoringResponseDto>> {
        const result = await this.breederAdminService.getApplications(user.userId, filter);
        return ApiResponseDto.success(result, '입양 신청 현황이 조회되었습니다.');
    }

    @Post('suspend/:breederId')
    @ApiEndpoint({
        summary: '브리더 제재 처리 (영구정지)',
        description: '브리더 계정을 영구정지 처리하고 알림을 발송합니다.',
        responseType: BreederSuspendResponseDto,
        isPublic: false,
    })
    async suspendBreeder(
        @CurrentUser() user: any,
        @Param('breederId') breederId: string,
        @Body() suspendData: BreederSuspendRequestDto,
    ): Promise<ApiResponseDto<BreederSuspendResponseDto>> {
        const result = await this.breederAdminService.suspendBreeder(user.userId, breederId, suspendData);
        return ApiResponseDto.success(result, '브리더 계정이 영구정지 처리되었습니다.');
    }

    @Post('unsuspend/:breederId')
    @ApiEndpoint({
        summary: '브리더 정지 해제',
        description: '정지된 브리더 계정을 활성화하고 알림을 발송합니다.',
        responseType: BreederSuspendResponseDto,
        isPublic: false,
    })
    async unsuspendBreeder(
        @CurrentUser() user: any,
        @Param('breederId') breederId: string,
    ): Promise<ApiResponseDto<BreederSuspendResponseDto>> {
        const result = await this.breederAdminService.unsuspendBreeder(user.userId, breederId);
        return ApiResponseDto.success(result, '브리더 계정 정지가 해제되었습니다.');
    }

    @Post('remind')
    @ApiEndpoint({
        summary: '리마인드 알림 발송',
        description: '서류 미제출 브리더들에게 리마인드 알림을 발송합니다. (서비스 알림 + 이메일 알림)',
        responseType: BreederRemindResponseDto,
        isPublic: false,
    })
    async sendRemindNotifications(
        @CurrentUser() user: any,
        @Body() remindData: BreederRemindRequestDto,
    ): Promise<ApiResponseDto<BreederRemindResponseDto>> {
        const result = await this.breederAdminService.sendRemindNotifications(user.userId, remindData);
        return ApiResponseDto.success(result, `${result.successCount}명에게 리마인드 알림이 발송되었습니다.`);
    }

    @Patch('test-account/:breederId')
    @ApiEndpoint({
        summary: '테스트 계정 설정',
        description:
            '브리더를 테스트 계정으로 설정하거나 해제합니다. 테스트 계정은 탐색 페이지와 홈 화면에 노출되지 않습니다.',
        responseType: SetTestAccountResponseDto,
        isPublic: false,
    })
    async setTestAccount(
        @CurrentUser() user: any,
        @Param('breederId') breederId: string,
        @Body() dto: SetTestAccountRequestDto,
    ): Promise<ApiResponseDto<SetTestAccountResponseDto>> {
        const result = await this.breederAdminService.setTestAccount(user.userId, breederId, dto.isTestAccount);
        const message = dto.isTestAccount ? '테스트 계정으로 설정되었습니다.' : '테스트 계정이 해제되었습니다.';
        return ApiResponseDto.success(result, message);
    }
}
