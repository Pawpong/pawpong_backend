import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { BreederLevel } from '../../../../../../common/enum/user.enum';

/**
 * 브리더 레벨 변경 요청 DTO
 */
export class BreederLevelChangeRequestDto {
    /**
     * 새로운 브리더 레벨
     * @example "elite"
     */
    @ApiProperty({
        description: '새로운 브리더 레벨 (new: 뉴, elite: 엘리트)',
        example: 'elite',
        enum: BreederLevel,
    })
    @IsEnum(BreederLevel)
    newLevel: BreederLevel;
}
