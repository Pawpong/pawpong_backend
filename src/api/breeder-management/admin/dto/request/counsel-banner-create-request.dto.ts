import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';

/**
 * 상담 배너 생성 요청 DTO
 */
export class CounselBannerCreateRequestDto {
    /**
     * 배너 이미지 파일명
     * @example "counsel-banners/abc123.png"
     */
    @ApiProperty({
        description: '배너 이미지 파일명',
        example: 'counsel-banners/abc123.png',
    })
    @IsString()
    @IsNotEmpty()
    imageFileName: string;

    /**
     * 링크 타입
     * @example "internal"
     */
    @ApiProperty({
        description: '링크 타입',
        example: 'internal',
        enum: ['internal', 'external'],
        required: false,
    })
    @IsOptional()
    @IsEnum(['internal', 'external'])
    linkType?: string;

    /**
     * 링크 URL
     * @example "/breeders"
     */
    @ApiProperty({
        description: '링크 URL',
        example: '/breeders',
        required: false,
    })
    @IsOptional()
    @IsString()
    linkUrl?: string;

    /**
     * 배너 제목 (관리용)
     * @example "상담 신청 안내"
     */
    @ApiProperty({
        description: '배너 제목',
        example: '상담 신청 안내',
        required: false,
    })
    @IsOptional()
    @IsString()
    title?: string;

    /**
     * 배너 설명 (관리용)
     * @example "상담 신청 시 유의사항"
     */
    @ApiProperty({
        description: '배너 설명',
        example: '상담 신청 시 유의사항',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    /**
     * 정렬 순서
     * @example 0
     */
    @ApiProperty({
        description: '정렬 순서',
        example: 0,
    })
    @IsNumber()
    @Min(0)
    order: number;

    /**
     * 활성화 여부
     * @example true
     */
    @ApiProperty({
        description: '활성화 여부',
        example: true,
        default: true,
    })
    @IsOptional()
    isActive?: boolean;
}
