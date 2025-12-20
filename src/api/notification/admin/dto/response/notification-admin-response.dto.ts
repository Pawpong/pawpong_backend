import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { NotificationType } from '../../../../../schema/notification.schema';

/**
 * Admin 알림 상세 응답 DTO
 */
export class NotificationAdminResponseDto {
    /**
     * 알림 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '알림 ID',
        example: '507f1f77bcf86cd799439011',
    })
    notificationId: string;

    /**
     * 사용자 ID
     * @example "507f1f77bcf86cd799439012"
     */
    @ApiProperty({
        description: '사용자 ID',
        example: '507f1f77bcf86cd799439012',
    })
    userId: string;

    /**
     * 사용자 역할
     * @example "breeder"
     */
    @ApiProperty({
        description: '사용자 역할',
        enum: ['adopter', 'breeder'],
        example: 'breeder',
    })
    userRole: string;

    /**
     * 알림 타입
     * @example "NEW_CONSULT_REQUEST"
     */
    @ApiProperty({
        description: '알림 타입',
        enum: NotificationType,
        example: NotificationType.NEW_CONSULT_REQUEST,
    })
    type: NotificationType;

    /**
     * 알림 제목
     * @example "새로운 입양 상담 신청이 도착했어요!"
     */
    @ApiProperty({
        description: '알림 제목',
        example: '새로운 입양 상담 신청이 도착했어요!',
    })
    title: string;

    /**
     * 알림 내용
     * @example "지금 확인해 보세요."
     */
    @ApiProperty({
        description: '알림 내용',
        example: '지금 확인해 보세요.',
    })
    body: string;

    /**
     * 메타데이터
     */
    @ApiPropertyOptional({
        description: '메타데이터',
        example: { breederId: '507f1f77bcf86cd799439011', breederName: '포퐁 브리더' },
    })
    metadata?: Record<string, any>;

    /**
     * 읽음 여부
     * @example false
     */
    @ApiProperty({
        description: '읽음 여부',
        example: false,
    })
    isRead: boolean;

    /**
     * 읽은 시각
     */
    @ApiPropertyOptional({
        description: '읽은 시각',
        example: '2025-01-15T10:30:00.000Z',
    })
    readAt?: Date;

    /**
     * 클릭 시 이동할 URL
     */
    @ApiPropertyOptional({
        description: '클릭 시 이동할 URL',
        example: '/breeder/applications',
    })
    targetUrl?: string;

    /**
     * 생성 일시
     * @example "2025-01-15T10:00:00.000Z"
     */
    @ApiProperty({
        description: '생성 일시',
        example: '2025-01-15T10:00:00.000Z',
    })
    createdAt: Date;

    /**
     * 수정 일시
     * @example "2025-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '수정 일시',
        example: '2025-01-15T10:30:00.000Z',
    })
    updatedAt: Date;
}

/**
 * Admin 알림 통계 응답 DTO
 */
export class NotificationStatsResponseDto {
    /**
     * 전체 알림 수
     * @example 1000
     */
    @ApiProperty({
        description: '전체 알림 수',
        example: 1000,
    })
    totalNotifications: number;

    /**
     * 읽지 않은 알림 수
     * @example 150
     */
    @ApiProperty({
        description: '읽지 않은 알림 수',
        example: 150,
    })
    unreadNotifications: number;

    /**
     * 타입별 알림 수
     */
    @ApiProperty({
        description: '타입별 알림 수',
        example: {
            BREEDER_APPROVED: 50,
            NEW_CONSULT_REQUEST: 100,
            NEW_REVIEW_REGISTERED: 80,
        },
    })
    notificationsByType: Record<string, number>;

    /**
     * 역할별 알림 수
     */
    @ApiProperty({
        description: '역할별 알림 수',
        example: {
            adopter: 500,
            breeder: 500,
        },
    })
    notificationsByRole: Record<string, number>;
}
