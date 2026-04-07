import { Get } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetNotificationAdminStatsUseCase } from './application/use-cases/get-notification-admin-stats.use-case';
import { NotificationStatsResponseDto } from './dto/response/notification-admin-response.dto';
import { NotificationAdminProtectedController } from './decorator/notification-admin-controller.decorator';
import { ApiGetNotificationAdminStatsEndpoint } from './swagger';

@NotificationAdminProtectedController()
export class NotificationAdminStatsController {
    constructor(private readonly getNotificationAdminStatsUseCase: GetNotificationAdminStatsUseCase) {}

    @Get('stats')
    @ApiGetNotificationAdminStatsEndpoint()
    async getStats(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<NotificationStatsResponseDto>> {
        const result = await this.getNotificationAdminStatsUseCase.execute(userId);
        return ApiResponseDto.success(result, '알림 통계가 조회되었습니다.');
    }
}
