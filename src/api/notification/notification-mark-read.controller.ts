import { Param, Patch } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { NotificationProtectedController } from './decorator/notification-controller.decorator';
import { MarkAsReadResponseDto } from './dto/response/notification-response.dto';
import { ApiMarkNotificationReadEndpoint } from './swagger';

@NotificationProtectedController()
export class NotificationMarkReadController {
    constructor(private readonly markNotificationReadUseCase: MarkNotificationReadUseCase) {}

    @Patch(':id/read')
    @ApiMarkNotificationReadEndpoint()
    async markAsRead(
        @Param('id') notificationId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<MarkAsReadResponseDto>> {
        const result = await this.markNotificationReadUseCase.execute(userId, notificationId);
        return ApiResponseDto.success(result, '알림이 읽음 처리되었습니다.');
    }
}
