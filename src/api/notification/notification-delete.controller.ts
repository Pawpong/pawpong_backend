import { Delete, Param } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';
import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from './constants/notification-response-messages';
import { NotificationProtectedController } from './decorator/notification-controller.decorator';
import { ApiDeleteNotificationEndpoint } from './swagger';

@NotificationProtectedController()
export class NotificationDeleteController {
    constructor(private readonly deleteNotificationUseCase: DeleteNotificationUseCase) {}

    @Delete(':id')
    @ApiDeleteNotificationEndpoint()
    async deleteNotification(
        @Param('id') notificationId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.deleteNotificationUseCase.execute(userId, notificationId);
        return ApiResponseDto.success(null, NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationDeleted);
    }
}
