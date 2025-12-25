import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';

/**
 * 리마인드 알림 타입
 */
export enum RemindType {
    DOCUMENT_REMINDER = 'document_reminder', // [4] 입점 심사 독촉 알림
    PROFILE_COMPLETION_REMINDER = 'profile_completion_reminder', // [6] 프로필 완성 독려 알림
}

/**
 * 브리더 리마인드 알림 요청 DTO
 *
 * POST /api/breeder-admin/remind
 * 브리더들에게 리마인드 알림을 발송합니다.
 */
export class BreederRemindRequestDto {
    /**
     * 알림을 보낼 브리더 ID 목록
     * @example ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
     */
    @ApiProperty({
        description: '알림을 보낼 브리더 ID 목록',
        example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        type: [String],
    })
    @IsArray({ message: '브리더 ID 목록은 배열이어야 합니다.' })
    @IsNotEmpty({ message: '브리더 ID 목록은 필수입니다.' })
    breederIds: string[];

    /**
     * 리마인드 알림 타입
     * @example "document_reminder"
     */
    @ApiProperty({
        description: '리마인드 알림 타입',
        enum: RemindType,
        example: RemindType.DOCUMENT_REMINDER,
    })
    @IsEnum(RemindType, { message: '올바른 리마인드 타입을 선택해주세요.' })
    @IsNotEmpty({ message: '리마인드 타입은 필수입니다.' })
    remindType: RemindType;
}
