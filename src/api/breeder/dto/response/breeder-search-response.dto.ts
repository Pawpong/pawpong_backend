import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
export class BreederSearchItemResponseDto {
    @ApiProperty({
        description: '브리더 ID',
        example: '68dd57b1ae55c118139f6be3',
    })
    breederId: string;

    @ApiProperty({
        description: '브리더명',
        example: '바람개비 펫',
    })
    breederName: string;

    @ApiProperty({
        description: '대표 지역',
        example: '서울특별시',
    })
    location: string;

    @ApiProperty({
        description: '전문 분야',
        example: ['말티즈', '포메라니안'],
        oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    })
    specialization: string | string[];

    @ApiProperty({
        description: '평균 평점',
        example: 4.7,
    })
    averageRating: number;

    @ApiProperty({
        description: '총 후기 수',
        example: 12,
    })
    totalReviews: number;

    @ApiProperty({
        description: '프로필 이미지 URL',
        required: false,
        example: 'https://example.com/profiles/breeder-29.jpg',
    })
    profileImage?: string;

    @ApiProperty({
        description: '대표 사진 URL 배열',
        type: [String],
        example: ['https://example.com/photos/rep-29-1.jpg'],
    })
    profilePhotos: string[];

    @ApiProperty({
        description: '인증 상태',
        example: 'approved',
    })
    verificationStatus: string;

    @ApiProperty({
        description: '분양 중인 개체 수',
        example: 3,
    })
    availablePets: number;
}

/**
 * 브리더 검색 결과 응답 DTO
 * 공통 페이지네이션 모듈을 활용한 브리더 검색 API의 응답 데이터 구조입니다.
 */
export class BreederSearchResponseDto extends PaginationResponseDto<BreederSearchItemResponseDto> {
    /**
     * 검색된 브리더 목록 (items 필드를 override하여 명확한 타입 지정)
     */
    @ApiProperty({
        description: '검색된 브리더 목록',
        type: [BreederSearchItemResponseDto],
    })
    declare items: BreederSearchItemResponseDto[];
}
