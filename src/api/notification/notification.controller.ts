import { Controller, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiController, ApiEndpoint } from '../../common/decorator/swagger.decorator';

import { NotificationService } from './notification.service';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import {
    NotificationListResponseDto,
    NotificationItemDto,
    ReadNotificationsResponseDto,
    UnreadCountResponseDto,
} from './dto/response/notification-response.dto';

@ApiController('알림')
@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    @ApiEndpoint({
        summary: '알림 목록 조회 (초기 로딩)',
        description: '신규 알림(읽지 않은 알림)은 전체 반환, 읽은 알림은 첫 페이지(10개)만 반환합니다.',
        responseType: NotificationListResponseDto,
    })
    async getNotifications(
        @CurrentUser() user: any,
        @Query('limit') limit: number = 10,
    ): Promise<ApiResponseDto<NotificationListResponseDto>> {
        const result = await this.notificationService.getNotifications(user.userId, user.userType, Number(limit));
        return ApiResponseDto.success(result, '알림 목록이 조회되었습니다.');
    }

    @Get('read')
    @ApiEndpoint({
        summary: '읽은 알림 더보기',
        description: '읽은 알림을 페이지네이션으로 조회합니다. (더보기 용)',
        responseType: ReadNotificationsResponseDto,
    })
    async getReadNotifications(
        @CurrentUser() user: any,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<ApiResponseDto<ReadNotificationsResponseDto>> {
        const result = await this.notificationService.getReadNotifications(
            user.userId,
            user.userType,
            Number(page),
            Number(limit),
        );
        return ApiResponseDto.success(result, '읽은 알림 목록이 조회되었습니다.');
    }

    @Get('unread-count')
    @ApiEndpoint({
        summary: '읽지 않은 알림 수 조회',
        description: '로그인한 사용자의 읽지 않은 알림 수를 조회합니다.',
        responseType: UnreadCountResponseDto,
    })
    async getUnreadCount(@CurrentUser() user: any): Promise<ApiResponseDto<UnreadCountResponseDto>> {
        const unreadCount = await this.notificationService.getUnreadCount(user.userId, user.userType);
        return ApiResponseDto.success({ unreadCount }, '읽지 않은 알림 수가 조회되었습니다.');
    }

    @Patch(':id/read')
    @ApiEndpoint({
        summary: '알림 읽음 처리',
        description: '특정 알림을 읽음 처리하고, 읽음 처리된 알림 정보를 반환합니다.',
        responseType: NotificationItemDto,
    })
    async markAsRead(
        @Param('id') notificationId: string,
        @CurrentUser() user: any,
    ): Promise<ApiResponseDto<NotificationItemDto>> {
        const result = await this.notificationService.markAsRead(notificationId, user.userId);
        return ApiResponseDto.success(result, '알림이 읽음 처리되었습니다.');
    }

    @Patch('read-all')
    @ApiEndpoint({
        summary: '모든 알림 읽음 처리',
        description: '모든 신규 알림을 읽음 처리합니다.',
    })
    async markAllAsRead(@CurrentUser() user: any): Promise<ApiResponseDto<{ count: number }>> {
        const count = await this.notificationService.markAllAsRead(user.userId, user.userType);
        return ApiResponseDto.success({ count }, `${count}개의 알림이 읽음 처리되었습니다.`);
    }

    @Delete(':id')
    @ApiEndpoint({
        summary: '알림 삭제',
        description: '특정 알림을 삭제합니다.',
    })
    async deleteNotification(
        @Param('id') notificationId: string,
        @CurrentUser() user: any,
    ): Promise<ApiResponseDto<null>> {
        await this.notificationService.deleteNotification(notificationId, user.userId);
        return ApiResponseDto.success(null, '알림이 삭제되었습니다.');
    }
}
