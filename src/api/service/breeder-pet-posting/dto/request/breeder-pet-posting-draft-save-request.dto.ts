import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';

/**
 * 임시저장 전용 완화 DTO 모음.
 *
 * 작성 요청 DTO 를 PartialType 으로 감싸면 최상위 필드만 옵션이 되고
 * 중첩 DTO(접종 기록, 부모 정보 등)의 required 검증은 그대로 남아
 * "쓰다 만 기록"이 있는 폼이 거부된다 — 임시저장의 핵심 계약(미완성 허용)이 깨진다.
 * 그래서 중첩까지 전 필드 옵션인 draft 전용 클래스를 별도로 정의한다.
 * 타입/형식 검증(문자열·숫자·enum·날짜 형식, 배열 상한)은 유지해 쓰레기 값은 막는다.
 */

class DraftVaccinationRecordDto {
    @ApiPropertyOptional({ description: '접종명 (미완성 허용)', example: '종합백신' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: '접종일 (YYYY-MM-DD, 미완성 허용)', example: '2024-12-01' })
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiPropertyOptional({ description: '차수 (미완성 허용)', example: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    round?: number;
}

class DraftGeneticTestRecordDto {
    @ApiPropertyOptional({ description: '검사 검진일 (YYYY-MM-DD, 미완성 허용)', example: '2025-02-15' })
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiPropertyOptional({ description: '검사 기관 (미완성 허용)', example: '한국유전자검사센터' })
    @IsOptional()
    @IsString()
    institution?: string;

    @ApiPropertyOptional({ description: '검사명 (미완성 허용)', example: '슬개골 탈구 검사' })
    @IsOptional()
    @IsString()
    testName?: string;

    @ApiPropertyOptional({ description: '검사 결과 (미완성 허용)', example: '정상' })
    @IsOptional()
    @IsString()
    result?: string;
}

class DraftParentPetSnapshotDto {
    @ApiPropertyOptional({ description: '부모 관계 (미완성 허용)', enum: ['mother', 'father'], example: 'mother' })
    @IsOptional()
    @IsEnum(['mother', 'father'])
    relation?: 'mother' | 'father';

    @ApiPropertyOptional({ description: '품종 (미완성 허용)', example: '레오파드게코' })
    @IsOptional()
    @IsString()
    breed?: string;

    @ApiPropertyOptional({ description: '이름 (미완성 허용)', example: '마망' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: '태어난 날짜 (YYYY-MM-DD, 미완성 허용)', example: '2020-04-10' })
    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @ApiPropertyOptional({ description: '부모 사진 파일명', example: 'available-pets/abc/parent.jpg' })
    @IsOptional()
    @IsString()
    photoFileName?: string;
}

class DraftBreedingEnvironmentDto {
    @ApiPropertyOptional({ description: '사육 환경 설명 (최대 1000자)', example: '온습도 일정한 전용 사육장' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiPropertyOptional({
        description: '사육 환경 사진 파일명 배열 (최대 5장)',
        type: [String],
        maxItems: 5,
    })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(5)
    @IsString({ each: true })
    photoFileNames?: string[];

    @ApiPropertyOptional({ description: '[deprecated] 사육 환경 사진 파일명 (단일)', deprecated: true })
    @IsOptional()
    @IsString()
    photoFileName?: string;
}

/**
 * v2 분양글 임시저장 요청 DTO.
 *
 * 작성 요청과 동일한 필드 구성이지만 중첩 구조까지 포함해 전 필드가 옵션이다.
 * - photos 는 빈 배열도 허용 (작성 요청의 최소 1장 규칙 미적용), 상한 10장은 유지
 * - cross-field 규칙(접종 상태-기록 상호 배타 등)은 임시저장 단계에서 강제하지 않는다
 */
export class SaveBreederPetPostingDraftRequestDto {
    @ApiPropertyOptional({ description: '품종 및 이름', example: '레오파드게코 도마뱀(만다린)' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: '품종 (검색용 normalized)', example: '레오파드게코' })
    @IsOptional()
    @IsString()
    breed?: string;

    @ApiPropertyOptional({ description: '성별', enum: ['male', 'female'] })
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

    @ApiPropertyOptional({ description: '아이 소개 (최대 500자)', example: '귀여운 파이리' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({
        description: '이미지 파일명 배열 (0~10장 — 임시저장은 빈 배열 허용)',
        type: [String],
        maxItems: 10,
    })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(10)
    @IsString({ each: true })
    photos?: string[];

    @ApiPropertyOptional({ description: '대표 사진 인덱스 (0-based)', minimum: 0, maximum: 9 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(9)
    representativePhotoIndex?: number;

    @ApiPropertyOptional({ description: '동물 종류', enum: ['dog', 'cat', 'reptile'] })
    @IsOptional()
    @IsEnum(['dog', 'cat', 'reptile'])
    petType?: 'dog' | 'cat' | 'reptile';

    @ApiPropertyOptional({ description: '예방 접종 상태', enum: ['completed', 'incomplete'] })
    @IsOptional()
    @IsEnum(['completed', 'incomplete'])
    vaccinationStatus?: 'completed' | 'incomplete';

    @ApiPropertyOptional({
        description: '예방 접종 기록 (기록 내부 필드도 미완성 허용)',
        type: [DraftVaccinationRecordDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DraftVaccinationRecordDto)
    vaccinationRecords?: DraftVaccinationRecordDto[];

    @ApiPropertyOptional({ description: '예방 접종 미완료 사유 (최대 500자)' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    vaccinationIncompleteReason?: string;

    @ApiPropertyOptional({ description: '유전병 검사 상태', enum: ['completed', 'incomplete'] })
    @IsOptional()
    @IsEnum(['completed', 'incomplete'])
    geneticTestStatus?: 'completed' | 'incomplete';

    @ApiPropertyOptional({
        description: '유전병 검사 기록 (기록 내부 필드도 미완성 허용)',
        type: [DraftGeneticTestRecordDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DraftGeneticTestRecordDto)
    geneticTestRecords?: DraftGeneticTestRecordDto[];

    @ApiPropertyOptional({ description: '유전병 검사 미완료 사유 (최대 500자)' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    geneticTestIncompleteReason?: string;

    @ApiPropertyOptional({
        description: '부모 정보 스냅샷 (0~2개, 내부 필드 미완성 허용)',
        type: [DraftParentPetSnapshotDto],
    })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(2)
    @ValidateNested({ each: true })
    @Type(() => DraftParentPetSnapshotDto)
    parentPetSnapshots?: DraftParentPetSnapshotDto[];

    @ApiPropertyOptional({ description: '사육 환경 (전 필드 옵션)', type: DraftBreedingEnvironmentDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => DraftBreedingEnvironmentDto)
    breedingEnvironment?: DraftBreedingEnvironmentDto;
}
