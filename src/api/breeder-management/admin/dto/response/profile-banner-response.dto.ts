import { ApiProperty } from '@nestjs/swagger';

/**
 * 프로필 배너 응답 DTO
 */
export class ProfileBannerResponseDto {
    /**
     * 배너 고유 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '배너 고유 ID',
        example: '507f1f77bcf86cd799439011',
    })
    bannerId: string;

    /**
     * 배너 이미지 URL (CDN)
     * @example "https://cdn.example.com/profile-banners/abc123.png"
     */
    @ApiProperty({
        description: '배너 이미지 URL',
        example: 'https://cdn.example.com/profile-banners/abc123.png',
    })
    imageUrl: string;

    /**
     * 배너 이미지 파일명
     * @example "profile-banners/abc123.png"
     */
    @ApiProperty({
        description: '배너 이미지 파일명',
        example: 'profile-banners/abc123.png',
    })
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
    linkUrl?: string;

    /**
     * 배너 제목 (관리용, 선택)
     * @example "브리더 관리 바로가기"
     */
    @ApiProperty({
        description: '배너 제목',
        example: '브리더 관리 바로가기',
        required: false,
    })
    title?: string;

    /**
     * 배너 설명 (관리용, 선택)
     * @example "브리더 승인 및 관리"
     */
    @ApiProperty({
        description: '배너 설명',
        example: '브리더 승인 및 관리',
        required: false,
    })
    description?: string;

    /**
     * 정렬 순서
     * @example 0
     */
    @ApiProperty({
        description: '정렬 순서',
        example: 0,
    })
    order: number;

    /**
     * 활성화 여부
     * @example true
     */
    @ApiProperty({
        description: '활성화 여부',
        example: true,
    })
    isActive: boolean;
}
