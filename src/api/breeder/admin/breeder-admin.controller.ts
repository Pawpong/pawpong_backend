import { Controller, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/user.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { BreederSuspendRequestDto } from './dto/request/breeder-suspend-request.dto';
import { BreederRemindRequestDto } from './dto/request/breeder-remind-request.dto';
import { SetTestAccountRequestDto } from './dto/request/set-test-account-request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { BreederSuspendResponseDto } from './dto/response/breeder-suspend-response.dto';
import { BreederRemindResponseDto } from './dto/response/breeder-remind-response.dto';
import { SetTestAccountResponseDto } from './dto/response/set-test-account-response.dto';
import { SendBreederRemindNotificationsUseCase } from './application/use-cases/send-breeder-remind-notifications.use-case';
import { SetBreederTestAccountUseCase } from './application/use-cases/set-breeder-test-account.use-case';
import { SuspendBreederUseCase } from './application/use-cases/suspend-breeder.use-case';
import { UnsuspendBreederUseCase } from './application/use-cases/unsuspend-breeder.use-case';
import {
    ApiBreederAdminController,
    ApiSendBreederRemindNotificationsAdminEndpoint,
    ApiSetBreederTestAccountAdminEndpoint,
    ApiSuspendBreederAdminEndpoint,
    ApiUnsuspendBreederAdminEndpoint,
} from './swagger';

/**
 * 브리더 관리 Admin 컨트롤러
 *
 * 브리더 도메인에 대한 관리자 전용 API를 제공합니다.
 * 모든 엔드포인트는 admin 권한이 필요합니다.
 *
 * 주요 기능:
 * - 브리더 제재 처리 (정지/해제)
 * - 리마인드 알림 발송
 * - 테스트 계정 설정
 *
 * 분리된 기능:
 * - 브리더 인증 관리 → BreederVerificationAdminModule (/api/breeder-verification-admin)
 * - 브리더 레벨 변경 → BreederVerificationAdminModule (/api/breeder-verification-admin/level)
 */
@ApiBreederAdminController()
@Controller('breeder-admin')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BreederAdminController {
    constructor(
        private readonly suspendBreederUseCase: SuspendBreederUseCase,
        private readonly unsuspendBreederUseCase: UnsuspendBreederUseCase,
        private readonly sendBreederRemindNotificationsUseCase: SendBreederRemindNotificationsUseCase,
        private readonly setBreederTestAccountUseCase: SetBreederTestAccountUseCase,
    ) {}

    @Post('suspend/:breederId')
    @ApiSuspendBreederAdminEndpoint()
    async suspendBreeder(
        @CurrentUser('userId') adminId: string,
        @Param('breederId') breederId: string,
        @Body() suspendData: BreederSuspendRequestDto,
    ): Promise<ApiResponseDto<BreederSuspendResponseDto>> {
        const result = await this.suspendBreederUseCase.execute(adminId, breederId, suspendData);
        return ApiResponseDto.success(result, '브리더 계정이 영구정지 처리되었습니다.');
    }

    @Post('unsuspend/:breederId')
    @ApiUnsuspendBreederAdminEndpoint()
    async unsuspendBreeder(
        @CurrentUser('userId') adminId: string,
        @Param('breederId') breederId: string,
    ): Promise<ApiResponseDto<BreederSuspendResponseDto>> {
        const result = await this.unsuspendBreederUseCase.execute(adminId, breederId);
        return ApiResponseDto.success(result, '브리더 계정 정지가 해제되었습니다.');
    }

    @Post('remind')
    @ApiSendBreederRemindNotificationsAdminEndpoint()
    async sendRemindNotifications(
        @CurrentUser('userId') adminId: string,
        @Body() remindData: BreederRemindRequestDto,
    ): Promise<ApiResponseDto<BreederRemindResponseDto>> {
        const result = await this.sendBreederRemindNotificationsUseCase.execute(adminId, remindData);
        return ApiResponseDto.success(result, `${result.successCount}명에게 리마인드 알림이 발송되었습니다.`);
    }

    @Patch('test-account/:breederId')
    @ApiSetBreederTestAccountAdminEndpoint()
    async setTestAccount(
        @CurrentUser('userId') adminId: string,
        @Param('breederId') breederId: string,
        @Body() dto: SetTestAccountRequestDto,
    ): Promise<ApiResponseDto<SetTestAccountResponseDto>> {
        const result = await this.setBreederTestAccountUseCase.execute(adminId, breederId, dto.isTestAccount);
        const message = dto.isTestAccount ? '테스트 계정으로 설정되었습니다.' : '테스트 계정이 해제되었습니다.';
        return ApiResponseDto.success(result, message);
    }
}
