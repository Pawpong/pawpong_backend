import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from './application/use-cases/get-unread-notification-count.use-case';
import { NotificationProtectedController } from './decorator/notification-controller.decorator';
import { NotificationListRequestDto } from './dto/request/notification-list-request.dto';
import { NotificationResponseDto, UnreadCountResponseDto } from './dto/response/notification-response.dto';
import { ApiGetNotificationsEndpoint, ApiGetUnreadNotificationCountEndpoint } from './swagger';

@NotificationProtectedController()
export class NotificationQueryController {
    constructor(
        private readonly getNotificationsUseCase: GetNotificationsUseCase,
        private readonly getUnreadNotificationCountUseCase: GetUnreadNotificationCountUseCase,
    ) {}

    @Get()
    @ApiGetNotificationsEndpoint()
    async getNotifications(
        @CurrentUser('userId') userId: string,
        @Query() filter: NotificationListRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<NotificationResponseDto>>> {
        const result = await this.getNotificationsUseCase.execute(userId, filter);
        return ApiResponseDto.success(result, '알림 목록이 조회되었습니다.');
    }

    @Get('unread-count')
    @ApiGetUnreadNotificationCountEndpoint()
    async getUnreadCount(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<UnreadCountResponseDto>> {
        const result = await this.getUnreadNotificationCountUseCase.execute(userId);
        return ApiResponseDto.success(result, '읽지 않은 알림 수가 조회되었습니다.');
    }
}
