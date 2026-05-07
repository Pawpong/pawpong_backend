import { ApiProperty } from '@nestjs/swagger';

export class AdoptionPetResponseDto {
    @ApiProperty({ description: '동물 ID', example: '507f1f77bcf86cd799439011' })
    petId: string;

    @ApiProperty({ description: '브리더 ID', example: '507f1f77bcf86cd799439022' })
    breederId: string;

    @ApiProperty({ description: '브리더 이름', required: false })
    breederName?: string;

    @ApiProperty({ description: '동물 이름', example: '레오파드 개코도마뱀 (만다린)' })
    name: string;

    @ApiProperty({ description: '품종', example: '레오파드 개코도마뱀' })
    breed: string;

    @ApiProperty({ description: '동물 종류', enum: ['dog', 'cat', 'reptile'], required: false })
    petType?: 'dog' | 'cat' | 'reptile';

    @ApiProperty({ description: '성별', enum: ['male', 'female'] })
    gender: 'male' | 'female';

    @ApiProperty({ description: '나이 표현 (예: "6개월", "2살 3개월")', example: '6개월' })
    ageDescription: string;

    @ApiProperty({ description: '분양 가격 (원)', example: 1500000 })
    price: number;

    @ApiProperty({ description: '분양 상태', enum: ['available', 'reserved', 'adopted'] })
    status: 'available' | 'reserved' | 'adopted';

    @ApiProperty({ description: '대표 사진 signed URL' })
    primaryPhotoUrl: string;

    @ApiProperty({ description: '사진 signed URL 배열', type: [String] })
    photoUrls: string[];

    @ApiProperty({ description: '문의 수', example: 1 })
    inquiryCount: number;

    @ApiProperty({ description: '관심 등록 수', example: 10 })
    favoriteCount: number;

    @ApiProperty({ description: '조회 수', example: 20 })
    viewCount: number;

    @ApiProperty({ description: '현재 사용자가 즐겨찾기 등록한 동물 여부', example: false })
    isFavorited: boolean;

    @ApiProperty({ description: '인기🔥 배지 노출 여부', example: false })
    isPopular: boolean;

    @ApiProperty({ description: '등록 시각', example: '2025-01-15T00:00:00.000Z' })
    createdAt: string;
}

export class AdoptionFavoriteResponseDto {
    @ApiProperty({ description: '대상 동물 ID' })
    petId: string;

    @ApiProperty({ description: '즐겨찾기 등록 후 favoriteCount' })
    favoriteCount: number;

    @ApiProperty({ description: '즐겨찾기 토글 결과', example: true })
    success: boolean;
}
