import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

/**
 * v2 분양글 부분 수정 요청 DTO.
 *
 * 본 슬라이스 화이트리스트: 단순/안전 필드 위주.
 * vaccination/geneticTest/parents/breedingEnvironment 처럼 cross-field validation 이 복잡한
 * 필드는 받지 않는다 (서버에서 무시) — use-case 의 PersistData 도 해당 필드를 포함하지 않는다.
 */
export class UpdateBreederPetPostingRequestDto {
    @ApiPropertyOptional({ description: '품종 및 이름', example: '레오파드게코 도마뱀(만다린)' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @ApiPropertyOptional({ description: '품종 (검색용 normalized)', example: '레오파드게코' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    breed?: string;

    @ApiPropertyOptional({ description: '성별', enum: ['male', 'female'], example: 'female' })
    @IsOptional()
    @IsEnum(['male', 'female'])
    gender?: 'male' | 'female';

    @ApiPropertyOptional({ description: '태어난 날짜 (YYYY-MM-DD)', example: '2024-11-05' })
    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @ApiPropertyOptional({ description: '분양가 (원)', example: 200000, minimum: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price?: number;

    @ApiPropertyOptional({ description: '아이 소개', example: '귀여운 파이리', maxLength: 500 })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({ description: '동물 종류', enum: ['dog', 'cat', 'reptile'] })
    @IsOptional()
    @IsEnum(['dog', 'cat', 'reptile'])
    petType?: 'dog' | 'cat' | 'reptile';

    @ApiPropertyOptional({
        description: '분양 상태 전환 (분양가능 → 예약중 → 분양완료)',
        enum: ['available', 'reserved', 'adopted'],
    })
    @IsOptional()
    @IsEnum(['available', 'reserved', 'adopted'])
    status?: 'available' | 'reserved' | 'adopted';

    @ApiPropertyOptional({
        description: '이미지 파일명 배열 (1~10장, 갱신 시 전체 교체)',
        type: [String],
        minItems: 1,
        maxItems: 10,
    })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(10)
    @IsString({ each: true })
    photos?: string[];

    @ApiPropertyOptional({ description: '대표 사진 인덱스', example: 0, minimum: 0, maximum: 9 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(9)
    representativePhotoIndex?: number;
}
