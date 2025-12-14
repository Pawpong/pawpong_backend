import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional } from 'class-validator';

/**
 * 프로필 배너 수정 요청 DTO
 */
export class ProfileBannerUpdateRequestDto {
    /**
     * 배너 이미지 파일명
     * @example "profile-banners/abc123.png"
     */
    @ApiProperty({
        description: '배너 이미지 파일명',
        example: 'profile-banners/abc123.png',
        required: false,
    })
    @IsString()
    @IsOptional()
    imageFileName?: string;

    /**
     * 링크 타입
     * @example "internal"
     */
    @ApiProperty({
        description: '링크 타입 (internal: 내부 링크, external: 외부 링크)',
        example: 'internal',
        enum: ['internal', 'external'],
        required: false,
    })
    @IsEnum(['internal', 'external'])
    @IsOptional()
    linkType?: string;

    /**
     * 링크 URL
     * @example "/breeders/management"
     */
    @ApiProperty({
        description: '링크 URL',
        example: '/breeders/management',
        required: false,
    })
    @IsString()
    @IsOptional()
    linkUrl?: string;

    /**
     * 정렬 순서
     * @example 0
     */
    @ApiProperty({
        description: '정렬 순서 (낮을수록 먼저 표시)',
        example: 0,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    order?: number;

    /**
     * 활성화 여부
     * @example true
     */
    @ApiProperty({
        description: '활성화 여부',
        example: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    /**
     * 배너 제목 (관리용, 선택)
     * @example "브리더 관리 바로가기"
     */
    @ApiProperty({
        description: '배너 제목 (관리용)',
        example: '브리더 관리 바로가기',
        required: false,
    })
    @IsString()
    @IsOptional()
    title?: string;

    /**
     * 배너 설명 (관리용, 선택)
     * @example "브리더 승인 및 관리"
     */
    @ApiProperty({
        description: '배너 설명 (관리용)',
        example: '브리더 승인 및 관리',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;
}
