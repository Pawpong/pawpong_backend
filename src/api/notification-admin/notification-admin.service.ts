import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationType } from '../../schema/notification.schema';
import { NotificationAdminListRequestDto } from './dto/request/notification-admin-list-request.dto';
import {
    NotificationAdminResponseDto,
    NotificationStatsResponseDto,
} from './dto/response/notification-admin-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { PaginationBuilder } from '../../common/dto/pagination/pagination-builder.dto';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';

/**
 * 관리자 알림 관리 서비스
 * - 모든 사용자의 알림 조회
 * - 알림 통계 조회
 */
@Injectable()
export class NotificationAdminService {
    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<Notification>,
        private readonly logger: CustomLoggerService,
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
        this.logger.logStart('getNotifications', '관리자 알림 목록 조회 시작', {
            adminUserId,
            filter,
        });

        try {
            // 쿼리 조건 구성
            const query: any = {};

            if (filter.userId) {
                query.userId = filter.userId;
            }

            if (filter.userRole) {
                query.userRole = filter.userRole;
            }

            if (filter.type) {
                query.type = filter.type;
            }

            if (filter.isRead !== undefined) {
                query.isRead = filter.isRead;
            }

            // 페이지네이션 설정
            const page = filter.pageNumber || 1;
            const limit = filter.itemsPerPage || 20;
            const skip = (page - 1) * limit;

            // 병렬로 데이터 조회 및 총 개수 조회
            const [notifications, totalItems] = await Promise.all([
                this.notificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
                this.notificationModel.countDocuments(query).exec(),
            ]);

            // DTO 매핑
            const items: NotificationAdminResponseDto[] = notifications.map((n) => ({
                notificationId: n._id.toString(),
                userId: n.userId,
                userRole: n.userRole,
                type: n.type,
                title: n.title,
                body: n.body,
                metadata: n.metadata,
                isRead: n.isRead,
                readAt: n.readAt,
                targetUrl: n.targetUrl,
                createdAt: n.createdAt,
                updatedAt: n.updatedAt,
            }));

            // 페이지네이션 응답 생성
            const result = new PaginationBuilder<NotificationAdminResponseDto>()
                .setItems(items)
                .setPage(page)
                .setTake(limit)
                .setTotalCount(totalItems)
                .build();

            this.logger.logSuccess('getNotifications', '관리자 알림 목록 조회 완료', {
                totalItems,
                itemsReturned: items.length,
                page,
            });

            return result;
        } catch (error) {
            this.logger.logError('getNotifications', '관리자 알림 목록 조회 실패', error);
            throw new BadRequestException('알림 목록을 조회할 수 없습니다.');
        }
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
        this.logger.logStart('getStats', '관리자 알림 통계 조회 시작', { adminUserId });

        try {
            // 병렬로 통계 조회
            const [totalNotifications, unreadNotifications, notificationsByType, notificationsByRole] =
                await Promise.all([
                    // 전체 알림 수
                    this.notificationModel.countDocuments().exec(),

                    // 읽지 않은 알림 수
                    this.notificationModel.countDocuments({ isRead: false }).exec(),

                    // 타입별 알림 수 집계
                    this.notificationModel.aggregate([
                        {
                            $group: {
                                _id: '$type',
                                count: { $sum: 1 },
                            },
                        },
                    ]),

                    // 역할별 알림 수 집계
                    this.notificationModel.aggregate([
                        {
                            $group: {
                                _id: '$userRole',
                                count: { $sum: 1 },
                            },
                        },
                    ]),
                ]);

            // 타입별 알림 수를 Record로 변환
            const typeStats: Record<string, number> = {};
            notificationsByType.forEach((item) => {
                typeStats[item._id] = item.count;
            });

            // 역할별 알림 수를 Record로 변환
            const roleStats: Record<string, number> = {};
            notificationsByRole.forEach((item) => {
                roleStats[item._id] = item.count;
            });

            const stats: NotificationStatsResponseDto = {
                totalNotifications,
                unreadNotifications,
                notificationsByType: typeStats,
                notificationsByRole: roleStats,
            };

            this.logger.logSuccess('getStats', '관리자 알림 통계 조회 완료', stats);

            return stats;
        } catch (error) {
            this.logger.logError('getStats', '관리자 알림 통계 조회 실패', error);
            throw new BadRequestException('알림 통계를 조회할 수 없습니다.');
        }
    }
}
