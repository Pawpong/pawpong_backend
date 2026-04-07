import { Delete, Param, Patch } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';
import { MarkAllNotificationsReadUseCase } from './application/use-cases/mark-all-notifications-read.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { NotificationProtectedController } from './decorator/notification-controller.decorator';
import { MarkAllAsReadResponseDto, MarkAsReadResponseDto } from './dto/response/notification-response.dto';
import {
    ApiDeleteNotificationEndpoint,
    ApiMarkAllNotificationsReadEndpoint,
    ApiMarkNotificationReadEndpoint,
} from './swagger';

@NotificationProtectedController()
export class NotificationCommandController {
    constructor(
        private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
        private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
        private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
    ) {}

    @Patch(':id/read')
    @ApiMarkNotificationReadEndpoint()
    async markAsRead(
        @Param('id') notificationId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<MarkAsReadResponseDto>> {
        const result = await this.markNotificationReadUseCase.execute(userId, notificationId);
        return ApiResponseDto.success(result, '알림이 읽음 처리되었습니다.');
    }

    @Patch('read-all')
    @ApiMarkAllNotificationsReadEndpoint()
    async markAllAsRead(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<MarkAllAsReadResponseDto>> {
        const result = await this.markAllNotificationsReadUseCase.execute(userId);
        return ApiResponseDto.success(result, `${result.updatedCount}개의 알림이 읽음 처리되었습니다.`);
    }

    @Delete(':id')
    @ApiDeleteNotificationEndpoint()
    async deleteNotification(
        @Param('id') notificationId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.deleteNotificationUseCase.execute(userId, notificationId);
        return ApiResponseDto.success(null, '알림이 삭제되었습니다.');
    }
}
