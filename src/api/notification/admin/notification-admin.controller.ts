import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/user.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { ApiController, ApiEndpoint } from '../../../common/decorator/swagger.decorator';

import { NotificationAdminService } from './notification-admin.service';

import { NotificationAdminListRequestDto } from './dto/request/notification-admin-list-request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import {
    NotificationAdminResponseDto,
    NotificationStatsResponseDto,
} from './dto/response/notification-admin-response.dto';

/**
 * 관리자 알림 관리 컨트롤러
 * - 모든 사용자의 알림 조회 (관리자 전용)
 * - 알림 통계 조회 (관리자 전용)
 */
@ApiController('관리자 알림 관리')
@Controller('notification-admin')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class NotificationAdminController {
    constructor(private readonly notificationAdminService: NotificationAdminService) {}

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
    @ApiEndpoint({
        summary: '알림 목록 조회 (관리자)',
        description:
            '관리자가 모든 사용자의 알림을 조회합니다. userId, userRole, type, isRead 필터를 지원하며 페이지네이션이 적용됩니다.',
        responseType: NotificationAdminResponseDto,
    })
    async getNotifications(
        @CurrentUser() user: any,
        @Query() filter: NotificationAdminListRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<NotificationAdminResponseDto>>> {
        // 관리자 ID 검증
        if (!user?.userId) {
            throw new Error('관리자 정보가 올바르지 않습니다.');
        }

        const result = await this.notificationAdminService.getNotifications(user.userId, filter);
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
    @ApiEndpoint({
        summary: '알림 통계 조회 (관리자)',
        description:
            '관리자가 알림 통계를 조회합니다. 전체 알림 수, 읽지 않은 알림 수, 타입별/역할별 알림 수를 제공합니다.',
        responseType: NotificationStatsResponseDto,
    })
    async getStats(@CurrentUser() user: any): Promise<ApiResponseDto<NotificationStatsResponseDto>> {
        // 관리자 ID 검증
        if (!user?.userId) {
            throw new Error('관리자 정보가 올바르지 않습니다.');
        }

        const result = await this.notificationAdminService.getStats(user.userId);
        return ApiResponseDto.success(result, '알림 통계가 조회되었습니다.');
    }
}
