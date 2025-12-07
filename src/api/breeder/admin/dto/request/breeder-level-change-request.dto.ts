import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

/**
 * 브리더 레벨 변경 요청 DTO
 *
 * PATCH /api/breeder-admin/level/:breederId
 * 승인된 브리더의 레벨을 뉴 ↔ 엘리트로 변경합니다.
 */
export class BreederLevelChangeRequestDto {
    /**
     * 변경할 브리더 레벨
     * - new: 뉴 브리더
     * - elite: 엘리트 브리더
     * @example "elite"
     */
    @ApiProperty({
        description: '변경할 브리더 레벨 (new: 뉴, elite: 엘리트)',
        enum: ['new', 'elite'],
        example: 'elite',
    })
    @IsEnum(['new', 'elite'], { message: '브리더 레벨은 new 또는 elite만 가능합니다.' })
    @IsNotEmpty({ message: '브리더 레벨은 필수입니다.' })
    level: 'new' | 'elite';
}
