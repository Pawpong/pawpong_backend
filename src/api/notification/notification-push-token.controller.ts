import { BadRequestException, Body, Delete, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { RegisterPushDeviceTokenUseCase } from './application/use-cases/register-push-device-token.use-case';
import { UnregisterPushDeviceTokenUseCase } from './application/use-cases/unregister-push-device-token.use-case';
import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from './constants/notification-response-messages';
import { NotificationProtectedController } from './decorator/notification-controller.decorator';
import { RegisterPushDeviceTokenRequestDto } from './dto/request/register-push-device-token-request.dto';
import {
    ApiRegisterPushDeviceTokenEndpoint,
    ApiUnregisterPushDeviceTokenEndpoint,
} from './swagger';

/**
 * 디바이스 푸시 토큰 등록/해제 컨트롤러
 * RN 앱이 FCM 토큰 발급 직후 호출합니다.
 */
@NotificationProtectedController()
export class NotificationPushTokenController {
    constructor(
        private readonly registerPushDeviceTokenUseCase: RegisterPushDeviceTokenUseCase,
        private readonly unregisterPushDeviceTokenUseCase: UnregisterPushDeviceTokenUseCase,
    ) {}

    @Post('push-token')
    @ApiRegisterPushDeviceTokenEndpoint()
    async registerPushToken(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') userRole: string,
        @Body() body: RegisterPushDeviceTokenRequestDto,
    ): Promise<ApiResponseDto<null>> {
        const normalizedRole = this.normalizeRole(userRole);
        await this.registerPushDeviceTokenUseCase.execute({
            userId,
            userRole: normalizedRole,
            token: body.token,
            platform: body.platform,
            appVersion: body.appVersion,
        });
        return ApiResponseDto.success(null, NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.pushDeviceTokenRegistered);
    }

    @Delete('push-token/:token')
    @ApiUnregisterPushDeviceTokenEndpoint()
    async unregisterPushToken(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') userRole: string,
        @Param('token') token: string,
    ): Promise<ApiResponseDto<null>> {
        const normalizedRole = this.normalizeRole(userRole);
        await this.unregisterPushDeviceTokenUseCase.execute({
            userId,
            userRole: normalizedRole,
            token,
        });
        return ApiResponseDto.success(null, NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.pushDeviceTokenUnregistered);
    }

    private normalizeRole(role: string): 'adopter' | 'breeder' {
        if (role === 'adopter' || role === 'breeder') {
            return role;
        }
        throw new BadRequestException('푸시 토큰은 입양자 또는 브리더만 등록할 수 있습니다.');
    }
}
