import { Get } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetUnreadNotificationCountUseCase } from './application/use-cases/get-unread-notification-count.use-case';
import { NotificationProtectedController } from './decorator/notification-controller.decorator';
import { NotificationUnreadCountResponseMessageService } from './domain/services/notification-unread-count-response-message.service';
import { UnreadCountResponseDto } from './dto/response/notification-response.dto';
import { ApiGetUnreadNotificationCountEndpoint } from './swagger';

@NotificationProtectedController()
export class NotificationUnreadCountController {
    constructor(
        private readonly getUnreadNotificationCountUseCase: GetUnreadNotificationCountUseCase,
        private readonly notificationUnreadCountResponseMessageService: NotificationUnreadCountResponseMessageService,
    ) {}

    @Get('unread-count')
    @ApiGetUnreadNotificationCountEndpoint()
    async getUnreadCount(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<UnreadCountResponseDto>> {
        const result = await this.getUnreadNotificationCountUseCase.execute(userId);
        return ApiResponseDto.success(
            result,
            this.notificationUnreadCountResponseMessageService.unreadCountRetrieved(),
        );
    }
}
