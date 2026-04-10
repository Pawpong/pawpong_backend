import { Get } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetNotificationAdminStatsUseCase } from './application/use-cases/get-notification-admin-stats.use-case';
import { NotificationStatsResponseMessageService } from '../domain/services/notification-stats-response-message.service';
import { NotificationStatsResponseDto } from './dto/response/notification-admin-response.dto';
import { NotificationAdminProtectedController } from './decorator/notification-admin-controller.decorator';
import { ApiGetNotificationAdminStatsEndpoint } from './swagger';

@NotificationAdminProtectedController()
export class NotificationAdminStatsController {
    constructor(
        private readonly getNotificationAdminStatsUseCase: GetNotificationAdminStatsUseCase,
        private readonly notificationStatsResponseMessageService: NotificationStatsResponseMessageService,
    ) {}

    @Get('stats')
    @ApiGetNotificationAdminStatsEndpoint()
    async getStats(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<NotificationStatsResponseDto>> {
        const result = await this.getNotificationAdminStatsUseCase.execute(userId);
        return ApiResponseDto.success(result, this.notificationStatsResponseMessageService.notificationStatsRetrieved());
    }
}
