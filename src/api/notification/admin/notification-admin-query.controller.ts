import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetAdminNotificationsUseCase } from './application/use-cases/get-admin-notifications.use-case';
import { NotificationQueryResponseMessageService } from '../domain/services/notification-query-response-message.service';
import { NotificationAdminListRequestDto } from './dto/request/notification-admin-list-request.dto';
import { NotificationAdminResponseDto } from './dto/response/notification-admin-response.dto';
import { NotificationAdminProtectedController } from './decorator/notification-admin-controller.decorator';
import { ApiGetAdminNotificationsEndpoint } from './swagger';

@NotificationAdminProtectedController()
export class NotificationAdminQueryController {
    constructor(
        private readonly getAdminNotificationsUseCase: GetAdminNotificationsUseCase,
        private readonly notificationQueryResponseMessageService: NotificationQueryResponseMessageService,
    ) {}

    @Get('notifications')
    @ApiGetAdminNotificationsEndpoint()
    async getNotifications(
        @CurrentUser('userId') userId: string,
        @Query() filter: NotificationAdminListRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<NotificationAdminResponseDto>>> {
        const result = await this.getAdminNotificationsUseCase.execute(userId, filter);
        return ApiResponseDto.success(result, this.notificationQueryResponseMessageService.notificationsListed());
    }
}
