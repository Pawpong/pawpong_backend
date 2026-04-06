import { Injectable } from '@nestjs/common';

import { NotificationAdminListRequestDto } from './dto/request/notification-admin-list-request.dto';
import {
    NotificationAdminResponseDto,
    NotificationStatsResponseDto,
} from './dto/response/notification-admin-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { GetAdminNotificationsUseCase } from './application/use-cases/get-admin-notifications.use-case';
import { GetNotificationAdminStatsUseCase } from './application/use-cases/get-notification-admin-stats.use-case';

/**
 * 관리자 알림 관리 서비스
 * - 모든 사용자의 알림 조회
 * - 알림 통계 조회
 */
@Injectable()
export class NotificationAdminService {
    constructor(
        private readonly getAdminNotificationsUseCase: GetAdminNotificationsUseCase,
        private readonly getNotificationAdminStatsUseCase: GetNotificationAdminStatsUseCase,
    ) {}

    /**
     * 관리자용 알림 목록 조회
     * - 모든 사용자의 알림을 필터링하여 조회
     * - userId, userRole, type, isRead 필터 지원
     * @param adminUserId 관리자 ID (로깅용)
     * @param filter 필터 조건
     * @returns 페이지네이션된 알림 목록
     */
    async getNotifications(
        adminUserId: string,
        filter: NotificationAdminListRequestDto,
    ): Promise<PaginationResponseDto<NotificationAdminResponseDto>> {
        return this.getAdminNotificationsUseCase.execute(adminUserId, filter);
    }

    /**
     * 관리자용 알림 통계 조회
     * - 전체 알림 수, 읽지 않은 알림 수
     * - 타입별 알림 수
     * - 역할별 알림 수
     * @param adminUserId 관리자 ID (로깅용)
     * @returns 알림 통계 정보
     */
    async getStats(adminUserId: string): Promise<NotificationStatsResponseDto> {
        return this.getNotificationAdminStatsUseCase.execute(adminUserId);
    }
}
