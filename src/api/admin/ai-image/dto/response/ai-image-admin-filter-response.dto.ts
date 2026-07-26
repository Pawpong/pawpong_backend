import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 어드민 필터 응답 (프롬프트 포함 — 관리자 전용) */
export class AiImageAdminFilterResponseDto {
    @ApiProperty({ description: '필터 ID', example: '507f1f77bcf86cd799439011' })
    filterId: string;

    @ApiProperty({ description: '필터명', example: '포근한 버섯 상점' })
    name: string;

    @ApiProperty({ description: '필터 설명', example: '반려동물을 버섯 가게 주인으로' })
    description: string;

    @ApiPropertyOptional({ description: '썸네일 URL' })
    thumbnailUrl?: string;

    @ApiProperty({ description: '썸네일 S3 파일키', nullable: true })
    thumbnailFileName: string | null;

    @ApiProperty({ description: '이미지 변환 프롬프트' })
    prompt: string;

    @ApiProperty({ description: '제외할 요소 프롬프트' })
    negativePrompt: string;

    @ApiProperty({ description: '이미지 모델', example: 'gpt-image-1' })
    model: string;

    @ApiProperty({ description: '출력 크기', example: '1024x1024' })
    outputSize: string;

    @ApiProperty({ description: '레퍼런스 이미지 S3 파일키 목록', type: [String] })
    referenceImageObjectKeys: string[];

    @ApiProperty({ description: '사용자 노출 여부', example: true })
    isActive: boolean;

    @ApiProperty({ description: '정렬 순서', example: 0 })
    sortOrder: number;

    @ApiProperty({ description: '생성 일시 (ISO 8601)' })
    createdAt: string;

    @ApiProperty({ description: '수정 일시 (ISO 8601)' })
    updatedAt: string;
}

/** 필터 삭제 응답 */
export class AiImageFilterDeleteResponseDto {
    @ApiProperty({ description: '삭제된 필터 ID', example: '507f1f77bcf86cd799439011' })
    filterId: string;

    @ApiProperty({ description: '삭제 완료 여부', example: true })
    deleted: boolean;
}
