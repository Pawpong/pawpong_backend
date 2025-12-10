import { Controller, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiController, ApiEndpoint } from '../../common/decorator/swagger.decorator';

import { NotificationService } from './notification.service';
import { NotificationListRequestDto } from './dto/request/notification-list-request.dto';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import {
    NotificationResponseDto,
    UnreadCountResponseDto,
    MarkAsReadResponseDto,
    MarkAllAsReadResponseDto,
} from './dto/response/notification-response.dto';

/**
 * 알림 컨트롤러
 * 사용자의 알림 조회, 읽음 처리, 삭제 기능 제공
 */
@ApiController('알림')
@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    @ApiEndpoint({
        summary: '알림 목록 조회',
        description: '사용자의 알림 목록을 페이지네이션으로 조회합니다. isRead 파라미터로 필터링 가능합니다.',
        responseType: NotificationResponseDto,
    })
    async getNotifications(
        @CurrentUser() user: any,
        @Query() filter: NotificationListRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<NotificationResponseDto>>> {
        const result = await this.notificationService.getNotifications(user.userId, filter);
        return ApiResponseDto.success(result, '알림 목록이 조회되었습니다.');
    }

    @Get('unread-count')
    @ApiEndpoint({
        summary: '읽지 않은 알림 수 조회',
        description: '로그인한 사용자의 읽지 않은 알림 수를 조회합니다.',
        responseType: UnreadCountResponseDto,
    })
    async getUnreadCount(@CurrentUser() user: any): Promise<ApiResponseDto<UnreadCountResponseDto>> {
        const result = await this.notificationService.getUnreadCount(user.userId);
        return ApiResponseDto.success(result, '읽지 않은 알림 수가 조회되었습니다.');
    }

    @Patch(':id/read')
    @ApiEndpoint({
        summary: '알림 읽음 처리',
        description: '특정 알림을 읽음 처리합니다.',
        responseType: MarkAsReadResponseDto,
    })
    async markAsRead(
        @Param('id') notificationId: string,
        @CurrentUser() user: any,
    ): Promise<ApiResponseDto<MarkAsReadResponseDto>> {
        const result = await this.notificationService.markAsRead(user.userId, notificationId);
        return ApiResponseDto.success(result, '알림이 읽음 처리되었습니다.');
    }

    @Patch('read-all')
    @ApiEndpoint({
        summary: '모든 알림 읽음 처리',
        description: '사용자의 모든 읽지 않은 알림을 읽음 처리합니다.',
        responseType: MarkAllAsReadResponseDto,
    })
    async markAllAsRead(@CurrentUser() user: any): Promise<ApiResponseDto<MarkAllAsReadResponseDto>> {
        const result = await this.notificationService.markAllAsRead(user.userId);
        return ApiResponseDto.success(result, `${result.updatedCount}개의 알림이 읽음 처리되었습니다.`);
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
        await this.notificationService.deleteNotification(user.userId, notificationId);
        return ApiResponseDto.success(null, '알림이 삭제되었습니다.');
    }
}
