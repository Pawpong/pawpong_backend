import { Patch } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { MarkAllNotificationsReadUseCase } from './application/use-cases/mark-all-notifications-read.use-case';
import { NotificationProtectedController } from './decorator/notification-controller.decorator';
import { NotificationResponseMessageService } from './domain/services/notification-response-message.service';
import { MarkAllAsReadResponseDto } from './dto/response/notification-response.dto';
import { ApiMarkAllNotificationsReadEndpoint } from './swagger';

@NotificationProtectedController()
export class NotificationMarkAllReadController {
    constructor(
        private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
        private readonly notificationResponseMessageService: NotificationResponseMessageService,
    ) {}

    @Patch('read-all')
    @ApiMarkAllNotificationsReadEndpoint()
    async markAllAsRead(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<MarkAllAsReadResponseDto>> {
        const result = await this.markAllNotificationsReadUseCase.execute(userId);
        return ApiResponseDto.success(
            result,
            this.notificationResponseMessageService.allNotificationsMarkedRead(result.updatedCount),
        );
    }
}
