import { Body, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';

import { SendAdminPushUseCase } from '../application/use-cases/send-admin-push.use-case';
import { NotificationAdminProtectedController } from '../decorator/notification-admin-controller.decorator';
import { SendAdminPushRequestDto } from '../dto/request/send-admin-push-request.dto';
import { AdminPushResultResponseDto } from '../dto/response/admin-push-result.dto';
import { ApiSendAdminPushEndpoint } from '../swagger';

/**
 * POST /api/notification-admin/push — 어드민 푸시 발송.
 * 대상: 입양자 전체 / 브리더 전체 / 개별 입양자 / 개별 브리더 (target.type 으로 분기)
 */
@NotificationAdminProtectedController()
export class NotificationAdminPushSendController {
    constructor(private readonly useCase: SendAdminPushUseCase) {}

    @Post('push')
    @ApiSendAdminPushEndpoint()
    async send(@Body() body: SendAdminPushRequestDto): Promise<ApiResponseDto<AdminPushResultResponseDto>> {
        const result = await this.useCase.execute({
            target:
                body.target.type === 'individual'
                    ? {
                          type: 'individual',
                          role: body.target.role!,
                          userId: body.target.userId!,
                      }
                    : { type: body.target.type as 'all_adopters' | 'all_breeders' },
            title: body.title,
            body: body.body,
            targetUrl: body.targetUrl,
        });
        return ApiResponseDto.success(result, '어드민 푸시 발송이 완료되었습니다.');
    }
}
