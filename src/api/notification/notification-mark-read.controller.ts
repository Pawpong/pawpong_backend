import { Param, Patch } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { NotificationProtectedController } from './decorator/notification-controller.decorator';
import { NotificationResponseMessageService } from './domain/services/notification-response-message.service';
import { MarkAsReadResponseDto } from './dto/response/notification-response.dto';
import { ApiMarkNotificationReadEndpoint } from './swagger';

@NotificationProtectedController()
export class NotificationMarkReadController {
    constructor(
        private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
        private readonly notificationResponseMessageService: NotificationResponseMessageService,
    ) {}

    @Patch(':id/read')
    @ApiMarkNotificationReadEndpoint()
    async markAsRead(
        @Param('id') notificationId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<MarkAsReadResponseDto>> {
        const result = await this.markNotificationReadUseCase.execute(userId, notificationId);
        return ApiResponseDto.success(result, this.notificationResponseMessageService.notificationMarkedRead());
    }
}
