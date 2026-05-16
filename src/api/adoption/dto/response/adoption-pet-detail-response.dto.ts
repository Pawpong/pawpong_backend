import { ApiProperty } from '@nestjs/swagger';

import { AdoptionPetResponseDto } from './adoption-pet-response.dto';

export class AdoptionPetVaccinationRecordDto {
    @ApiProperty({ description: '백신 이름', example: '종합백신(DHPPL)' })
    name: string;

    @ApiProperty({ description: '접종일 ISO', example: '2025-12-08T00:00:00.000Z' })
    date: string;

    @ApiProperty({ description: '차수', example: 5 })
    round: number;
}

export class AdoptionPetGeneticTestRecordDto {
    @ApiProperty({ description: '검진일 ISO', example: '2025-12-08T00:00:00.000Z' })
    date: string;

    @ApiProperty({ description: '검사기관', example: '홀리유전자' })
    institution: string;

    @ApiProperty({ description: '검사명', example: '고요산뇨증' })
    testName: string;

    @ApiProperty({ description: '결과', example: '정상' })
    result: string;
}

export class AdoptionPetParentDto {
    @ApiProperty({ description: '관계', enum: ['mother', 'father'] })
    relation: 'mother' | 'father';

    @ApiProperty({ description: '품종', example: '레오파드 개코도마뱀' })
    breed: string;

    @ApiProperty({ description: '이름', example: '레오파드개코 (만다린)' })
    name: string;

    @ApiProperty({ description: '생년월일 ISO', required: false })
    birthDate?: string;

    @ApiProperty({ description: '사진 signed URL', required: false })
    photoUrl?: string;
}

export class AdoptionPetBreedingEnvironmentDto {
    @ApiProperty({ description: '사육 환경 설명', required: false })
    description?: string;

    @ApiProperty({ description: '사육 환경 사진 signed URL', required: false })
    photoUrl?: string;
}

export class AdoptionPetBreederBlockDto {
    @ApiProperty({ description: '브리더 ID' })
    breederId: string;

    @ApiProperty({ description: '표시용 닉네임', example: '도심속 도마뱀 사장님' })
    displayName: string;

    @ApiProperty({ description: '프로필 이미지 signed URL', required: false })
    profileImageUrl?: string;

    @ApiProperty({
        description: '위치 표기 (district > city 순). 상세 주소는 PII 라 공개 응답에서 제외한다.',
        example: '독산동',
        required: false,
    })
    locationText?: string;

    @ApiProperty({ description: 'Pawpong 활동 점수', example: 80 })
    bpm: number;
}

/**
 * v2 입양 상세 응답 (Figma 39:1240).
 * 카드 응답 필드 + 건강/부모/사육환경/브리더 요약을 포함한다.
 */
export class AdoptionPetDetailResponseDto extends AdoptionPetResponseDto {
    @ApiProperty({ description: '소개', required: false })
    description?: string;

    @ApiProperty({ description: '태그', type: [String], example: ['#개코 도마뱀', '#만다린'] })
    tags: string[];

    @ApiProperty({ description: '출생일 ISO', example: '2025-06-20T00:00:00.000Z' })
    birthDate: string;

    @ApiProperty({
        description: '예방 접종 상태',
        enum: ['completed', 'incomplete'],
        required: false,
    })
    vaccinationStatus?: 'completed' | 'incomplete';

    @ApiProperty({ description: '예방 접종 기록', type: [AdoptionPetVaccinationRecordDto] })
    vaccinationRecords: AdoptionPetVaccinationRecordDto[];

    @ApiProperty({ description: '예방 접종 미완료 사유', required: false })
    vaccinationIncompleteReason?: string;

    @ApiProperty({
        description: '유전병 검사 상태',
        enum: ['completed', 'incomplete'],
        required: false,
    })
    geneticTestStatus?: 'completed' | 'incomplete';

    @ApiProperty({ description: '유전병 검사 기록', type: [AdoptionPetGeneticTestRecordDto] })
    geneticTestRecords: AdoptionPetGeneticTestRecordDto[];

    @ApiProperty({ description: '유전병 검사 미완료 사유', required: false })
    geneticTestIncompleteReason?: string;

    @ApiProperty({ description: '부모 정보 스냅샷', type: [AdoptionPetParentDto] })
    parents: AdoptionPetParentDto[];

    @ApiProperty({ description: '사육 환경', type: AdoptionPetBreedingEnvironmentDto, required: false })
    breedingEnvironment?: AdoptionPetBreedingEnvironmentDto;

    @ApiProperty({ description: '브리더 요약', type: AdoptionPetBreederBlockDto })
    breeder: AdoptionPetBreederBlockDto;
}
