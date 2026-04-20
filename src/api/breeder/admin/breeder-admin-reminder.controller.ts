import { Body, Post } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { SendBreederRemindNotificationsUseCase } from './application/use-cases/send-breeder-remind-notifications.use-case';
import { BreederAdminProtectedController } from './decorator/breeder-admin-controller.decorator';
import { BreederRemindRequestDto } from './dto/request/breeder-remind-request.dto';
import { BreederRemindResponseDto } from './dto/response/breeder-remind-response.dto';
import { ApiSendBreederRemindNotificationsAdminEndpoint } from './swagger';

@BreederAdminProtectedController()
export class BreederAdminReminderController {
    constructor(private readonly sendBreederRemindNotificationsUseCase: SendBreederRemindNotificationsUseCase) {}

    @Post('remind')
    @ApiSendBreederRemindNotificationsAdminEndpoint()
    async sendRemindNotifications(
        @CurrentUser('userId') adminId: string,
        @Body() remindData: BreederRemindRequestDto,
    ): Promise<ApiResponseDto<BreederRemindResponseDto>> {
        const result = await this.sendBreederRemindNotificationsUseCase.execute(adminId, remindData);
        return ApiResponseDto.success(result, `${result.successCount}명에게 리마인드 알림이 발송되었습니다.`);
    }
}
