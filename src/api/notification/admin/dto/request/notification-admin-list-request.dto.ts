import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { NotificationType } from '../../../../../schema/notification.schema';

/**
 * Admin 알림 목록 조회 요청 DTO
 */
export class NotificationAdminListRequestDto {
    /**
     * 사용자 ID 필터
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiPropertyOptional({
        description: '사용자 ID 필터',
        example: '507f1f77bcf86cd799439011',
    })
    @IsOptional()
    @IsString()
    userId?: string;

    /**
     * 사용자 역할 필터
     * @example "breeder"
     */
    @ApiPropertyOptional({
        description: '사용자 역할 필터',
        enum: ['adopter', 'breeder'],
        example: 'breeder',
    })
    @IsOptional()
    @IsEnum(['adopter', 'breeder'])
    userRole?: 'adopter' | 'breeder';

    /**
     * 알림 타입 필터
     * @example "NEW_CONSULT_REQUEST"
     */
    @ApiPropertyOptional({
        description: '알림 타입 필터',
        enum: NotificationType,
        example: NotificationType.NEW_CONSULT_REQUEST,
    })
    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    /**
     * 읽음 여부 필터
     * @example false
     */
    @ApiPropertyOptional({
        description: '읽음 여부 필터',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isRead?: boolean;

    /**
     * 페이지 번호
     * @example 1
     */
    @ApiPropertyOptional({
        description: '페이지 번호',
        example: 1,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    pageNumber?: number = 1;

    /**
     * 페이지당 항목 수
     * @example 20
     */
    @ApiPropertyOptional({
        description: '페이지당 항목 수',
        example: 20,
        default: 20,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    itemsPerPage?: number = 20;
}
