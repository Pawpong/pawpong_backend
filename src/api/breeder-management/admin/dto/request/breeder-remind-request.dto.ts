import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

/**
 * 브리더 리마인드 알림 요청 DTO
 *
 * POST /api/breeder-admin/remind
 * 서류 미제출 브리더들에게 리마인드 알림을 발송합니다.
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
}
