import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { NotificationType } from '../../../../schema/notification.schema';

/**
 * 알림 응답 DTO
 */
export class NotificationResponseDto {
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
     * 메타데이터 (브리더명, 반려동물명 등)
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
}

/**
 * 읽지 않은 알림 수 응답 DTO
 */
export class UnreadCountResponseDto {
    /**
     * 읽지 않은 알림 수
     * @example 5
     */
    @ApiProperty({
        description: '읽지 않은 알림 수',
        example: 5,
    })
    unreadCount: number;
}

/**
 * 알림 읽음 처리 응답 DTO
 */
export class MarkAsReadResponseDto {
    /**
     * 처리된 알림 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '처리된 알림 ID',
        example: '507f1f77bcf86cd799439011',
    })
    notificationId: string;

    /**
     * 읽음 여부
     * @example true
     */
    @ApiProperty({
        description: '읽음 여부',
        example: true,
    })
    isRead: boolean;

    /**
     * 읽은 시각
     * @example "2025-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '읽은 시각',
        example: '2025-01-15T10:30:00.000Z',
    })
    readAt: Date;
}

/**
 * 모든 알림 읽음 처리 응답 DTO
 */
export class MarkAllAsReadResponseDto {
    /**
     * 읽음 처리된 알림 수
     * @example 10
     */
    @ApiProperty({
        description: '읽음 처리된 알림 수',
        example: 10,
    })
    updatedCount: number;
}
