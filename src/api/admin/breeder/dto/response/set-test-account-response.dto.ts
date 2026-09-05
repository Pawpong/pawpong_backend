import { ApiProperty } from '@nestjs/swagger';

/**
 * 테스트 계정 설정 응답 DTO
 */
export class SetTestAccountResponseDto {
    @ApiProperty({
        description: '브리더 ID',
        example: '507f1f77bcf86cd799439011',
    })
    breederId: string;

    @ApiProperty({
        description: '브리더명',
        example: '행복한 강아지 농장',
    })
    breederName: string;

    @ApiProperty({
        description: '테스트 계정 여부',
        example: true,
    })
    isTestAccount: boolean;

    @ApiProperty({
        description: '변경 일시',
        example: '2025-01-01T00:00:00.000Z',
    })
    updatedAt: Date;
}
