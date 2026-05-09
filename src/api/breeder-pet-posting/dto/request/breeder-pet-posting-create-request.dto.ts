import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
    ValidateNested,
} from 'class-validator';

class VaccinationRecordRequestDto {
    @ApiProperty({ description: '접종명', example: '종합백신' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: '접종일 (YYYY-MM-DD)', example: '2024-12-01' })
    @IsDateString()
    date: string;

    @ApiProperty({ description: '차수 (1 이상)', example: 1, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    round: number;
}

class GeneticTestRecordRequestDto {
    @ApiProperty({ description: '검사 검진일 (YYYY-MM-DD)', example: '2025-02-15' })
    @IsDateString()
    date: string;

    @ApiProperty({ description: '검사 기관', example: '한국유전자검사센터' })
    @IsString()
    @IsNotEmpty()
    institution: string;

    @ApiProperty({ description: '검사명', example: '슬개골 탈구 검사' })
    @IsString()
    @IsNotEmpty()
    testName: string;

    @ApiProperty({ description: '검사 결과', example: '정상' })
    @IsString()
    @IsNotEmpty()
    result: string;
}

class ParentPetSnapshotRequestDto {
    @ApiProperty({ description: '부모 관계', enum: ['mother', 'father'], example: 'mother' })
    @IsEnum(['mother', 'father'])
    relation: 'mother' | 'father';

    @ApiProperty({ description: '품종', example: '레오파드게코' })
    @IsString()
    @IsNotEmpty()
    breed: string;

    @ApiProperty({ description: '이름', example: '마망' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ description: '태어난 날짜 (YYYY-MM-DD)', example: '2020-04-10' })
    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @ApiPropertyOptional({ description: '부모 사진 파일명', example: 'available-pets/abc/parent.jpg' })
    @IsOptional()
    @IsString()
    photoFileName?: string;
}

class BreedingEnvironmentRequestDto {
    @ApiPropertyOptional({ description: '사육 환경 설명 (최대 1000자)', example: '온습도 일정한 전용 사육장' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiPropertyOptional({ description: '사육 환경 사진 파일명', example: 'available-pets/abc/env.jpg' })
    @IsOptional()
    @IsString()
    photoFileName?: string;
}

/**
 * v2 분양글 작성 요청 DTO.
 *
 * Figma 분양글 작성 화면(566:30126) 기준:
 * - 이미지 1~10장 + 대표 사진 인덱스
 * - 펫 기본정보 (품종/이름, 분양가, 생년월일, 성별, 소개)
 * - 건강 정보 (예방 접종 / 유전병 검사 — 완료 시 records, 미완료 시 reason)
 * - 부모 정보 0~2개 (mother/father 각 최대 1)
 * - 사육 환경 (옵션)
 *
 * cross-field 규칙은 BreederPetPostingValidatorService 가 강제한다.
 */
export class CreateBreederPetPostingRequestDto {
    @ApiProperty({ description: '품종 및 이름', example: '레오파드게코 도마뱀(만다린)' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: '품종 (검색용 normalized)', example: '레오파드게코' })
    @IsString()
    @IsNotEmpty()
    breed: string;

    @ApiProperty({ description: '성별', enum: ['male', 'female'], example: 'female' })
    @IsEnum(['male', 'female'])
    gender: 'male' | 'female';

    @ApiProperty({ description: '태어난 날짜 (YYYY-MM-DD)', example: '2024-11-05' })
    @IsDateString()
    birthDate: string;

    @ApiProperty({ description: '분양가 (원)', example: 200000, minimum: 0 })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ description: '아이 소개 (사육 환경과 별개)', example: '귀여운 파이리' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    description: string;

    @ApiProperty({
        description: '이미지 파일명 배열 (1~10장)',
        type: [String],
        minItems: 1,
        maxItems: 10,
        example: ['available-pets/abc/1.jpg', 'available-pets/abc/2.jpg'],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(10)
    @IsString({ each: true })
    photos: string[];

    @ApiPropertyOptional({
        description: '대표 사진 인덱스 (photos 배열 내 0-based, 미지정 시 0)',
        example: 0,
        minimum: 0,
        maximum: 9,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(9)
    representativePhotoIndex?: number;

    @ApiPropertyOptional({ description: '동물 종류 (강아지/고양이/도마뱀)', enum: ['dog', 'cat', 'reptile'] })
    @IsOptional()
    @IsEnum(['dog', 'cat', 'reptile'])
    petType?: 'dog' | 'cat' | 'reptile';

    @ApiProperty({ description: '예방 접종 상태', enum: ['completed', 'incomplete'], example: 'completed' })
    @IsEnum(['completed', 'incomplete'])
    vaccinationStatus: 'completed' | 'incomplete';

    @ApiPropertyOptional({
        description: '예방 접종 기록 (vaccinationStatus = completed 일 때 1개 이상)',
        type: [VaccinationRecordRequestDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VaccinationRecordRequestDto)
    vaccinationRecords?: VaccinationRecordRequestDto[];

    @ApiPropertyOptional({
        description: '예방 접종 미완료 사유 (vaccinationStatus = incomplete 일 때 필수)',
        example: '태어난지 한달도 안됨',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    vaccinationIncompleteReason?: string;

    @ApiProperty({ description: '유전병 검사 상태', enum: ['completed', 'incomplete'], example: 'incomplete' })
    @IsEnum(['completed', 'incomplete'])
    geneticTestStatus: 'completed' | 'incomplete';

    @ApiPropertyOptional({
        description: '유전병 검사 기록 (geneticTestStatus = completed 일 때 1개 이상)',
        type: [GeneticTestRecordRequestDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GeneticTestRecordRequestDto)
    geneticTestRecords?: GeneticTestRecordRequestDto[];

    @ApiPropertyOptional({
        description: '유전병 검사 미완료 사유 (geneticTestStatus = incomplete 일 때 필수)',
        example: '태어난지 한달도 안됨',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    geneticTestIncompleteReason?: string;

    @ApiPropertyOptional({
        description: '부모 정보 스냅샷 (0~2개, 엄마/아빠 각 최대 1)',
        type: [ParentPetSnapshotRequestDto],
    })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(2)
    @ValidateNested({ each: true })
    @Type(() => ParentPetSnapshotRequestDto)
    parentPetSnapshots?: ParentPetSnapshotRequestDto[];

    @ApiPropertyOptional({ description: '사육 환경 (description + 사진 1장)', type: BreedingEnvironmentRequestDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => BreedingEnvironmentRequestDto)
    breedingEnvironment?: BreedingEnvironmentRequestDto;
}
