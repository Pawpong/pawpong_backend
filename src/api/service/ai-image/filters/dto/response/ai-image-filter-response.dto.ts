import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 사용자 필터 카드 (프롬프트 등 운영 정보 미포함) */
export class AiImageFilterResponseDto {
    @ApiProperty({ description: '필터 ID', example: '507f1f77bcf86cd799439011' })
    filterId: string;

    @ApiProperty({ description: '필터명', example: '포근한 버섯 상점' })
    name: string;

    @ApiProperty({ description: '필터 설명', example: '반려동물을 버섯 가게 주인으로' })
    description: string;

    @ApiPropertyOptional({ description: '썸네일 URL' })
    thumbnailUrl?: string;
}
