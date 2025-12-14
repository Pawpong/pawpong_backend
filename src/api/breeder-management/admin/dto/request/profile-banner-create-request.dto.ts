import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

/**
 * 프로필 배너 생성 요청 DTO
 */
export class ProfileBannerCreateRequestDto {
    /**
     * 배너 이미지 파일명
     * @example "profile-banners/abc123.png"
     */
    @ApiProperty({
        description: '배너 이미지 파일명',
        example: 'profile-banners/abc123.png',
    })
    @IsString()
    @IsNotEmpty()
    imageFileName: string;

    /**
     * 링크 타입 (선택)
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
     * 링크 URL (선택)
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
    })
    @IsNumber()
    @IsNotEmpty()
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
