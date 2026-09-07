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
    ValidateNested,
} from 'class-validator';

import {
    BreedingEnvironmentRequestDto,
    GeneticTestRecordRequestDto,
    ParentPetSnapshotRequestDto,
    VaccinationRecordRequestDto,
} from './breeder-pet-posting-create-request.dto';

/**
 * v2 분양글 부분 수정 요청 DTO.
 *
 * 미제공 필드는 기존 DB 값을 유지하고, 제공한 필드만 바꾼다.
 * 배열/객체 필드(photos, 부모 정보, 사육 환경)는 부분 병합이 아니라 **전체 교체**다.
 *
 * 건강 정보(vaccination / geneticTest)는 status 와 records/사유가 서로를 구속하므로
 * **그룹 단위로만** 수정할 수 있다 — 그룹 내 아무 필드나 보내면 status 도 함께 보내야 한다.
 * 부분적으로 보내면 DB 에 남은 값과 모순된 조합("완료인데 기록 없음")이 만들어지기 때문이다.
 * cross-field 규칙은 BreederPetPostingValidatorService.validateUpdate 가 강제한다.
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

    @ApiPropertyOptional({
        description:
            '[deprecated] 동물 종류. 브리더 계정 축종에 종속되어 글 단위로 변경할 수 없으며 요청 값은 무시된다.',
        enum: ['dog', 'cat', 'reptile'],
        deprecated: true,
    })
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

    @ApiPropertyOptional({
        description: '예방 접종 상태. 접종 그룹(status/records/사유) 중 아무 필드나 보내면 이 필드도 함께 보내야 한다.',
        enum: ['completed', 'incomplete'],
    })
    @IsOptional()
    @IsEnum(['completed', 'incomplete'])
    vaccinationStatus?: 'completed' | 'incomplete';

    @ApiPropertyOptional({
        description: '예방 접종 기록 (전체 교체). vaccinationStatus = completed 일 때 1개 이상 필수',
        type: [VaccinationRecordRequestDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VaccinationRecordRequestDto)
    vaccinationRecords?: VaccinationRecordRequestDto[];

    @ApiPropertyOptional({
        description: '예방 접종 미완료 사유 (vaccinationStatus = incomplete 일 때 필수). completed 로 바꾸면 삭제된다.',
        example: '태어난지 한달도 안됨',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    vaccinationIncompleteReason?: string;

    @ApiPropertyOptional({
        description:
            '유전병 검사 상태. 검사 그룹(status/records/사유) 중 아무 필드나 보내면 이 필드도 함께 보내야 한다.',
        enum: ['completed', 'incomplete'],
    })
    @IsOptional()
    @IsEnum(['completed', 'incomplete'])
    geneticTestStatus?: 'completed' | 'incomplete';

    @ApiPropertyOptional({
        description: '유전병 검사 기록 (전체 교체). geneticTestStatus = completed 일 때 1개 이상 필수',
        type: [GeneticTestRecordRequestDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GeneticTestRecordRequestDto)
    geneticTestRecords?: GeneticTestRecordRequestDto[];

    @ApiPropertyOptional({
        description:
            '유전병 검사 미완료 사유 (geneticTestStatus = incomplete 일 때 필수). completed 로 바꾸면 삭제된다.',
        example: '태어난지 한달도 안됨',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    geneticTestIncompleteReason?: string;

    @ApiPropertyOptional({
        description:
            '부모 정보 스냅샷 (0~2개, 엄마/아빠 각 최대 1). **갱신 시 전체 교체** — 보낸 배열이 기존 배열을 그대로 대체하며, 빈 배열을 보내면 부모 정보가 모두 지워진다.',
        type: [ParentPetSnapshotRequestDto],
    })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(2)
    @ValidateNested({ each: true })
    @Type(() => ParentPetSnapshotRequestDto)
    parentPetSnapshots?: ParentPetSnapshotRequestDto[];

    @ApiPropertyOptional({
        description:
            '사육 환경 (갱신 시 전체 교체). photoFileNames(최대 5장)가 정식이고 photoFileName(단일)은 deprecated — 둘 다 보내면 배열이 우선한다. 설명도 사진도 없는 객체를 보내면 사육 환경이 삭제된다.',
        type: BreedingEnvironmentRequestDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => BreedingEnvironmentRequestDto)
    breedingEnvironment?: BreedingEnvironmentRequestDto;
}
