import { ApiProperty } from '@nestjs/swagger';

import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';

/**
 * 즐겨찾기 브리더 데이터 DTO
 * 단일 즐겨찾기 브리더의 정보를 나타냅니다.
 */
export class FavoriteBreederDataDto {
    /**
     * 브리더 ID
     */
    @ApiProperty({ description: '브리더 ID' })
    breederId: string;

    /**
     * 브리더 이름
     */
    @ApiProperty({ description: '브리더 이름' })
    breederName: string;

    /**
     * 프로필 이미지 URL (Signed URL)
     */
    @ApiProperty({ description: '프로필 이미지 URL', required: false })
    profileImage?: string;

    /**
     * 대표 사진 배열 (Signed URLs)
     */
    @ApiProperty({ description: '대표 사진 배열', required: false, type: [String] })
    representativePhotos?: string[];

    /**
     * 브리더 레벨
     */
    @ApiProperty({ description: '브리더 레벨 (new, elite)', required: false })
    breederLevel?: string;

    /**
     * 반려동물 타입 (강아지/고양이)
     */
    @ApiProperty({ description: '반려동물 타입', required: false })
    petType?: string;

    /**
     * 위치 정보
     */
    @ApiProperty({ description: '위치 정보' })
    location: string;

    /**
     * 전문 분야
     */
    @ApiProperty({ description: '전문 분야', required: false })
    specialization?: string;

    /**
     * 평균 평점
     */
    @ApiProperty({ description: '평균 평점' })
    averageRating: number;

    /**
     * 총 후기 수
     */
    @ApiProperty({ description: '총 후기 수' })
    totalReviews: number;

    /**
     * 가격 범위 정보
     */
    @ApiProperty({
        description: '가격 범위 정보 (range: 가격표시, consultation: 상담후결정)',
        required: false,
    })
    priceRange?: {
        min: number;
        max: number;
        display: string; // "range" | "consultation"
    };

    /**
     * 분양 가능한 반려동물 수
     */
    @ApiProperty({ description: '분양 가능한 반려동물 수' })
    availablePets: number;

    /**
     * 즐겨찾기 추가 일시
     */
    @ApiProperty({ description: '즐겨찾기 추가 일시', format: 'date-time' })
    addedAt: Date;
}

/**
 * 즐겨찾기 브리더 목록 조회 응답 DTO
 * 공통 페이지네이션 모듈을 활용한 입양자가 즐겨찾기에 추가한 브리더 목록 응답입니다.
 */
export class FavoriteListResponseDto extends PaginationResponseDto<FavoriteBreederDataDto> {
    /**
     * 즐겨찾기 브리더 목록 (items 필드를 override하여 명확한 타입 지정)
     */
    @ApiProperty({
        description: '즐겨찾기 브리더 목록',
        type: [FavoriteBreederDataDto],
    })
    declare items: FavoriteBreederDataDto[];
}
