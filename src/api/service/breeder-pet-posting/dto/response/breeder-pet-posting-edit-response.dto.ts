import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 분양글 수정 화면 응답 DTO.
 *
 * 임시저장 조회(BreederPetPostingDraftDetailResponseDto)와 같은 계약이다 —
 * form 에는 저장된 파일키를 그대로 두고 미리보기 URL 을 같은 순서로 나란히 내려준다.
 * 임시저장 form 은 작성 중 payload 라 Record<string, unknown> 이었지만,
 * 발행된 글은 형태가 확정되어 있어 필드를 명시해 문서화한다.
 */
class BreederPetPostingEditVaccinationRecordDto {
    @ApiProperty({ description: '접종명', example: '종합백신' })
    name: string;

    @ApiProperty({ description: '접종일 (YYYY-MM-DD)', example: '2024-12-01' })
    date: string;

    @ApiProperty({ description: '차수', example: 1 })
    round: number;
}

class BreederPetPostingEditGeneticTestRecordDto {
    @ApiProperty({ description: '검사 검진일 (YYYY-MM-DD)', example: '2025-02-15' })
    date: string;

    @ApiProperty({ description: '검사 기관', example: '한국유전자검사센터' })
    institution: string;

    @ApiProperty({ description: '검사명', example: '슬개골 탈구 검사' })
    testName: string;

    @ApiProperty({ description: '검사 결과', example: '정상' })
    result: string;
}

class BreederPetPostingEditParentDto {
    @ApiProperty({ description: '부모 관계 (한글 변환 없이 원본값)', enum: ['mother', 'father'], example: 'mother' })
    relation: 'mother' | 'father';

    @ApiProperty({ description: '품종', example: '레오파드게코' })
    breed: string;

    @ApiProperty({ description: '이름', example: '마망' })
    name: string;

    @ApiPropertyOptional({ description: '태어난 날짜 (YYYY-MM-DD)', example: '2020-04-10' })
    birthDate?: string;

    @ApiPropertyOptional({ description: '부모 사진 파일키', example: 'available-pets/abc/parent.jpg' })
    photoFileName?: string;
}

class BreederPetPostingEditBreedingEnvironmentDto {
    @ApiPropertyOptional({ description: '사육 환경 설명', example: '온습도 일정한 전용 사육장' })
    description?: string;

    @ApiPropertyOptional({
        description: '사육 환경 사진 파일키 배열 (최대 5장)',
        type: [String],
        example: ['available-pets/abc/env-1.jpg'],
    })
    photoFileNames?: string[];

    @ApiPropertyOptional({
        description: '[deprecated] 단일 사진 파일키 — photoFileNames 로 대체됨',
        example: 'available-pets/abc/env.jpg',
        deprecated: true,
    })
    photoFileName?: string;
}

/**
 * 폼에 그대로 부을 수 있는 원시값 묶음 (분양글 작성 요청과 동일 shape).
 * 표시용 가공(가격 단위, relation 한글화, 날짜 포맷)은 하지 않는다.
 */
export class BreederPetPostingEditFormDto {
    @ApiProperty({ description: '품종 및 이름', example: '레오파드게코 도마뱀(만다린)' })
    name: string;

    @ApiProperty({ description: '품종', example: '레오파드게코' })
    breed: string;

    @ApiProperty({ description: '성별', enum: ['male', 'female'], example: 'female' })
    gender: 'male' | 'female';

    @ApiProperty({ description: '태어난 날짜 (YYYY-MM-DD)', example: '2024-11-05' })
    birthDate: string;

    @ApiProperty({ description: '분양가 (원, 단위 표기 없는 숫자)', example: 200000 })
    price: number;

    @ApiProperty({ description: '아이 소개', example: '귀여운 파이리' })
    description: string;

    @ApiProperty({
        description: '분양 개체 사진 파일키 배열 — PATCH 의 photos 에 그대로 되돌려 보낸다',
        type: [String],
        example: ['available-pets/abc/1.jpg', 'available-pets/abc/2.jpg'],
    })
    photos: string[];

    @ApiProperty({ description: '대표 사진 인덱스 (photos 기준 0-based)', example: 0 })
    representativePhotoIndex: number;

    @ApiPropertyOptional({
        description: '동물 종류 (브리더 계정 축종에서 파생, 수정 불가). 레거시 글은 비어 있을 수 있다.',
        enum: ['dog', 'cat', 'reptile'],
    })
    petType?: 'dog' | 'cat' | 'reptile';

    @ApiPropertyOptional({ description: '예방 접종 상태', enum: ['completed', 'incomplete'] })
    vaccinationStatus?: 'completed' | 'incomplete';

    @ApiProperty({ description: '예방 접종 기록', type: [BreederPetPostingEditVaccinationRecordDto] })
    vaccinationRecords: BreederPetPostingEditVaccinationRecordDto[];

    @ApiPropertyOptional({ description: '예방 접종 미완료 사유', example: '태어난지 한달도 안됨' })
    vaccinationIncompleteReason?: string;

    @ApiPropertyOptional({ description: '유전병 검사 상태', enum: ['completed', 'incomplete'] })
    geneticTestStatus?: 'completed' | 'incomplete';

    @ApiProperty({ description: '유전병 검사 기록', type: [BreederPetPostingEditGeneticTestRecordDto] })
    geneticTestRecords: BreederPetPostingEditGeneticTestRecordDto[];

    @ApiPropertyOptional({ description: '유전병 검사 미완료 사유', example: '태어난지 한달도 안됨' })
    geneticTestIncompleteReason?: string;

    @ApiProperty({ description: '부모 정보 스냅샷 (0~2개)', type: [BreederPetPostingEditParentDto] })
    parentPetSnapshots: BreederPetPostingEditParentDto[];

    @ApiPropertyOptional({ description: '사육 환경', type: BreederPetPostingEditBreedingEnvironmentDto })
    breedingEnvironment?: BreederPetPostingEditBreedingEnvironmentDto;
}

/**
 * 사진 미리보기용 URL.
 *
 * form 에는 파일키만 있고 클라이언트는 키를 URL 로 바꿀 수단이 없어 미리보기를 그릴 수 없다.
 * 저장 시에는 form 의 키를 그대로 돌려보내야 하므로 form 은 건드리지 않고
 * 표시용 URL 을 같은 순서로 나란히 내려준다.
 */
export class BreederPetPostingEditPhotoUrlsDto {
    @ApiProperty({
        description: '분양 개체 사진 URL — form.photos 와 같은 순서',
        type: [String],
        example: ['https://cdn.example.com/pet-postings/1.jpg'],
    })
    pet: string[];

    @ApiProperty({
        description: '부모 사진 URL — form.parentPetSnapshots 와 같은 순서. 사진 없는 행은 null',
        type: [String],
        nullable: true,
        example: ['https://cdn.example.com/pet-postings/mother.jpg', null],
    })
    parents: (string | null)[];

    @ApiProperty({
        description: '사육 환경 대표(첫 장) 사진 URL — 임시저장 조회와 동일한 필드. 없으면 null',
        nullable: true,
        example: 'https://cdn.example.com/pet-postings/env-1.jpg',
    })
    breedingEnvironment: string | null;

    @ApiProperty({
        description:
            '사육 환경 사진 URL 전체 — form.breedingEnvironment.photoFileNames 와 같은 순서 (최대 5장). ' +
            '사육 환경 사진은 여러 장이라 breedingEnvironment(첫 장) 만으로는 미리보기를 다 그릴 수 없어 함께 내려준다.',
        type: [String],
        example: ['https://cdn.example.com/pet-postings/env-1.jpg', 'https://cdn.example.com/pet-postings/env-2.jpg'],
    })
    breedingEnvironmentPhotos: string[];
}

export class BreederPetPostingEditDetailResponseDto {
    @ApiProperty({ description: '분양글(펫) ID', example: '507f1f77bcf86cd799439011' })
    petId: string;

    @ApiProperty({
        description: '수정 폼에 그대로 채울 값 (작성 요청과 동일 shape)',
        type: BreederPetPostingEditFormDto,
    })
    form: BreederPetPostingEditFormDto;

    @ApiProperty({
        description: '사진 미리보기용 URL (form 의 파일키와 같은 순서)',
        type: BreederPetPostingEditPhotoUrlsDto,
    })
    photoUrls: BreederPetPostingEditPhotoUrlsDto;

    @ApiProperty({ description: '분양 상태', enum: ['available', 'reserved', 'adopted'], example: 'available' })
    status: 'available' | 'reserved' | 'adopted';

    @ApiProperty({ description: '마지막 수정 시각 (ISO 8601)', example: '2026-08-17T10:30:00.000Z' })
    updatedAt: string;
}
