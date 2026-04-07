import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/user.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { NotificationAdminListRequestDto } from './dto/request/notification-admin-list-request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import {
    NotificationAdminResponseDto,
    NotificationStatsResponseDto,
} from './dto/response/notification-admin-response.dto';
import { GetAdminNotificationsUseCase } from './application/use-cases/get-admin-notifications.use-case';
import { GetNotificationAdminStatsUseCase } from './application/use-cases/get-notification-admin-stats.use-case';
import {
    ApiGetAdminNotificationsEndpoint,
    ApiGetNotificationAdminStatsEndpoint,
    ApiNotificationAdminController,
} from './swagger';

/**
 * 관리자 알림 관리 컨트롤러
 * - 모든 사용자의 알림 조회 (관리자 전용)
 * - 알림 통계 조회 (관리자 전용)
 */
@ApiNotificationAdminController()
@Controller('notification-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class NotificationAdminController {
    constructor(
        private readonly getAdminNotificationsUseCase: GetAdminNotificationsUseCase,
        private readonly getNotificationAdminStatsUseCase: GetNotificationAdminStatsUseCase,
    ) {}

    /**
     * 관리자용 알림 목록 조회
     * - 모든 사용자의 알림을 필터링하여 조회
     * - userId, userRole, type, isRead 필터 지원
     * - 페이지네이션 지원
     * @param user 현재 로그인한 관리자
     * @param filter 필터 조건
     * @returns 페이지네이션된 알림 목록
     */
    @Get('notifications')
    @ApiGetAdminNotificationsEndpoint()
    async getNotifications(
        @CurrentUser('userId') userId: string,
        @Query() filter: NotificationAdminListRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<NotificationAdminResponseDto>>> {
        const result = await this.getAdminNotificationsUseCase.execute(userId, filter);
        return ApiResponseDto.success(result, '알림 목록이 조회되었습니다.');
    }

    /**
     * 관리자용 알림 통계 조회
     * - 전체 알림 수, 읽지 않은 알림 수
     * - 타입별 알림 수
     * - 역할별 알림 수
     * @param user 현재 로그인한 관리자
     * @returns 알림 통계 정보
     */
    @Get('stats')
    @ApiGetNotificationAdminStatsEndpoint()
    async getStats(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<NotificationStatsResponseDto>> {
        const result = await this.getNotificationAdminStatsUseCase.execute(userId);
        return ApiResponseDto.success(result, '알림 통계가 조회되었습니다.');
    }
}
