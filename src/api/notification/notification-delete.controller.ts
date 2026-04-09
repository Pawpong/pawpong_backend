import { Delete, Param } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';
import { NotificationProtectedController } from './decorator/notification-controller.decorator';
import { NotificationResponseMessageService } from './domain/services/notification-response-message.service';
import { ApiDeleteNotificationEndpoint } from './swagger';

@NotificationProtectedController()
export class NotificationDeleteController {
    constructor(
        private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
        private readonly notificationResponseMessageService: NotificationResponseMessageService,
    ) {}

    @Delete(':id')
    @ApiDeleteNotificationEndpoint()
    async deleteNotification(
        @Param('id') notificationId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.deleteNotificationUseCase.execute(userId, notificationId);
        return ApiResponseDto.success(null, this.notificationResponseMessageService.notificationDeleted());
    }
}
