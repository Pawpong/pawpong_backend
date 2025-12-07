import { ApiProperty } from '@nestjs/swagger';

/**
 * 브리더 레벨 변경 응답 DTO
 */
export class BreederLevelChangeResponseDto {
    /**
     * 브리더 고유 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '브리더 고유 ID',
        example: '507f1f77bcf86cd799439011',
    })
    breederId: string;

    /**
     * 브리더 이름
     * @example "김철수"
     */
    @ApiProperty({
        description: '브리더 이름',
        example: '김철수',
    })
    breederName: string;

    /**
     * 이전 레벨
     * @example "new"
     */
    @ApiProperty({
        description: '이전 레벨',
        example: 'new',
    })
    previousLevel: string;

    /**
     * 새로운 레벨
     * @example "elite"
     */
    @ApiProperty({
        description: '새로운 레벨',
        example: 'elite',
    })
    newLevel: string;

    /**
     * 변경 일시
     * @example "2024-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '변경 일시',
        example: '2024-01-15T10:30:00.000Z',
    })
    changedAt: Date;

    /**
     * 변경한 관리자 이름
     * @example "관리자"
     */
    @ApiProperty({
        description: '변경한 관리자 이름',
        example: '관리자',
    })
    changedBy: string;
}
