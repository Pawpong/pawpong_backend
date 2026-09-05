import { ApiProperty } from '@nestjs/swagger';

/**
 * 분양 가능 반려동물 응답 DTO
 */
export class AvailablePetResponseDto {
    @ApiProperty({
        description: '반려동물 ID',
        example: '507f1f77bcf86cd799439011',
    })
    petId: string;

    @ApiProperty({
        description: '이름',
        example: '초코',
    })
    name: string;

    @ApiProperty({
        description: '품종',
        example: '포메라니안',
    })
    breed: string;

    @ApiProperty({
        description: '브리더 ID',
        example: '507f1f77bcf86cd799439012',
    })
    breederId: string;

    @ApiProperty({
        description: '브리더 이름',
        example: '행복 브리더',
    })
    breederName: string;

    @ApiProperty({
        description: '가격',
        example: 1500000,
        nullable: true,
        required: false,
    })
    price: number | null;

    @ApiProperty({
        description: '대표 사진 URL',
        example: 'https://cdn.pawpong.kr/pets/uuid.jpg?Expires=...',
    })
    mainPhoto: string;

    @ApiProperty({
        description: '생년월일',
        example: '2024-12-01T00:00:00.000Z',
        nullable: true,
        required: false,
    })
    birthDate: string | null;

    @ApiProperty({
        description: '개월 수',
        example: 4,
    })
    ageInMonths: number;

    @ApiProperty({
        description: '지역 정보',
        type: 'object',
        properties: {
            city: { type: 'string', example: '서울' },
            district: { type: 'string', example: '강남구' },
        },
    })
    location: {
        city: string;
        district: string;
    };
}
