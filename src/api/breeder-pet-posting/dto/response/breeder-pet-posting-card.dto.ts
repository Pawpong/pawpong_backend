import { ApiProperty } from '@nestjs/swagger';

/**
 * 마이홈 분양목록 탭 카드 응답.
 */
export class BreederPetPostingCardResponseDto {
    @ApiProperty({ description: '분양 펫 ID', example: '507f1f77bcf86cd799439011' })
    petId: string;

    @ApiProperty({ description: '품종 및 이름', example: '레오파드 개코도마뱀 (만다린)' })
    name: string;

    @ApiProperty({ description: '품종 (검색용 normalized)', example: '레오파드게코' })
    breed: string;

    @ApiProperty({ description: '성별', enum: ['male', 'female'] })
    gender: 'male' | 'female';

    @ApiProperty({ description: '나이 표현 (예: "6개월", "2살 3개월")', example: '6개월' })
    ageDescription: string;

    @ApiProperty({ description: '분양가 (원)', example: 200000 })
    price: number;

    @ApiProperty({ description: '분양 상태', enum: ['available', 'reserved', 'adopted'] })
    status: 'available' | 'reserved' | 'adopted';

    @ApiProperty({ description: '대표 사진 signed URL (representativePhotoIndex 기반)' })
    primaryPhotoUrl: string;

    @ApiProperty({ description: '사진 signed URL 배열', type: [String] })
    photoUrls: string[];

    @ApiProperty({ description: '아이 소개 (사육 환경과 별개)' })
    description: string;

    @ApiProperty({ description: '문의 수', example: 1 })
    inquiryCount: number;

    @ApiProperty({ description: '관심 등록 수', example: 10 })
    favoriteCount: number;

    @ApiProperty({ description: '조회 수', example: 20 })
    viewCount: number;

    @ApiProperty({ description: '등록 시각 (ISO 8601)', example: '2026-04-01T10:00:00.000Z' })
    createdAt: string;
}
