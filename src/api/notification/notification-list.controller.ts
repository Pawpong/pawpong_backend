import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { NotificationProtectedController } from './decorator/notification-controller.decorator';
import { NotificationQueryResponseMessageService } from './domain/services/notification-query-response-message.service';
import { NotificationListRequestDto } from './dto/request/notification-list-request.dto';
import { NotificationResponseDto } from './dto/response/notification-response.dto';
import { ApiGetNotificationsEndpoint } from './swagger';

@NotificationProtectedController()
export class NotificationListController {
    constructor(
        private readonly getNotificationsUseCase: GetNotificationsUseCase,
        private readonly notificationQueryResponseMessageService: NotificationQueryResponseMessageService,
    ) {}

    @Get()
    @ApiGetNotificationsEndpoint()
    async getNotifications(
        @CurrentUser('userId') userId: string,
        @Query() filter: NotificationListRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<NotificationResponseDto>>> {
        const result = await this.getNotificationsUseCase.execute(userId, filter);
        return ApiResponseDto.success(result, this.notificationQueryResponseMessageService.notificationsListed());
    }
}
