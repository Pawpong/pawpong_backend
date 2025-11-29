import { ApiProperty } from '@nestjs/swagger';

export class NotificationItemDto {
    @ApiProperty({ description: '알림 ID' })
    notificationId: string;

    @ApiProperty({ description: '알림 제목' })
    title: string;

    @ApiProperty({ description: '알림 내용' })
    content: string;

    @ApiProperty({ description: '알림 타입', enum: ['profile_review', 'profile_re_review', 'matching'] })
    type: string;

    @ApiProperty({ description: '읽음 여부' })
    isRead: boolean;

    @ApiProperty({ description: '생성 일시' })
    createdAt: Date;

    @ApiProperty({ description: '관련 리소스 ID', required: false })
    relatedId?: string;

    @ApiProperty({ description: '관련 리소스 타입', required: false })
    relatedType?: string;
}

export class PaginationDto {
    @ApiProperty({ description: '현재 페이지' })
    currentPage: number;

    @ApiProperty({ description: '페이지당 항목 수' })
    pageSize: number;

    @ApiProperty({ description: '총 개수' })
    totalItems: number;

    @ApiProperty({ description: '총 페이지 수' })
    totalPages: number;

    @ApiProperty({ description: '다음 페이지 존재 여부' })
    hasNextPage: boolean;

    @ApiProperty({ description: '이전 페이지 존재 여부' })
    hasPrevPage: boolean;
}

export class NotificationListResponseDto {
    @ApiProperty({ type: [NotificationItemDto], description: '신규 알림 (읽지 않은 알림 전체)' })
    unreadNotifications: NotificationItemDto[];

    @ApiProperty({ type: [NotificationItemDto], description: '읽은 알림 (첫 페이지)' })
    readNotifications: NotificationItemDto[];

    @ApiProperty({ description: '읽지 않은 알림 수' })
    unreadCount: number;

    @ApiProperty({ description: '읽은 알림 총 개수' })
    readTotalCount: number;

    @ApiProperty({ description: '읽은 알림 페이지네이션 정보', type: PaginationDto })
    pagination: PaginationDto;
}

export class ReadNotificationsResponseDto {
    @ApiProperty({ type: [NotificationItemDto], description: '읽은 알림 목록' })
    items: NotificationItemDto[];

    @ApiProperty({ description: '페이지네이션 정보', type: PaginationDto })
    pagination: PaginationDto;
}

export class UnreadCountResponseDto {
    @ApiProperty({ description: '읽지 않은 알림 수' })
    unreadCount: number;
}
