import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../../../../../common/enum/user.enum';

/**
 * 표준 신청 응답 데이터 DTO (어드민 상세 조회용)
 */
export class AdminStandardResponsesDto {
    @ApiProperty({ description: '개인정보 수집 동의 여부' })
    privacyConsent: boolean;

    @ApiProperty({ description: '자기소개' })
    selfIntroduction: string;

    @ApiProperty({ description: '가족 구성원 정보' })
    familyMembers: string;

    @ApiProperty({ description: '가족 동의 여부' })
    allFamilyConsent: boolean;

    @ApiProperty({ description: '알러지 검사 정보' })
    allergyTestInfo: string;

    @ApiProperty({ description: '집을 비우는 시간' })
    timeAwayFromHome: string;

    @ApiProperty({ description: '주거 공간 소개' })
    livingSpaceDescription: string;

    @ApiProperty({ description: '반려동물 경험' })
    previousPetExperience: string;

    @ApiProperty({ description: '기본 케어 가능 여부' })
    canProvideBasicCare: boolean;

    @ApiProperty({ description: '치료비 감당 가능 여부' })
    canAffordMedicalExpenses: boolean;

    @ApiProperty({ description: '관심 동물 특징', required: false })
    preferredPetDescription?: string;

    @ApiProperty({ description: '희망 입양 시기', required: false })
    desiredAdoptionTiming?: string;

    @ApiProperty({ description: '추가 메시지', required: false })
    additionalNotes?: string;
}

/**
 * 커스텀 질문 응답 DTO (어드민 상세 조회용)
 */
export class AdminCustomResponseDto {
    @ApiProperty({ description: '질문 ID' })
    questionId: string;

    @ApiProperty({ description: '질문 내용' })
    questionLabel: string;

    @ApiProperty({ description: '질문 타입 (text, textarea, select 등)' })
    questionType: string;

    @ApiProperty({ description: '응답 값' })
    answer: any;
}

/**
 * 입양 신청 상세 응답 DTO (어드민용)
 */
export class AdminApplicationDetailResponseDto {
    @ApiProperty({ description: '신청 고유 ID', example: '507f1f77bcf86cd799439011' })
    applicationId: string;

    @ApiProperty({ description: '입양자 이름', example: '홍길동' })
    adopterName: string;

    @ApiProperty({ description: '입양자 이메일', example: 'adopter@example.com' })
    adopterEmail: string;

    @ApiProperty({ description: '입양자 전화번호', example: '010-1234-5678' })
    adopterPhone: string;

    @ApiProperty({ description: '브리더 ID', example: '507f1f77bcf86cd799439022' })
    breederId: string;

    @ApiProperty({ description: '브리더 이름', example: '김브리더' })
    breederName: string;

    @ApiProperty({ description: '반려동물 이름', required: false })
    petName?: string;

    @ApiProperty({ description: '신청 상태', enum: ApplicationStatus })
    status: ApplicationStatus;

    @ApiProperty({ description: '표준 신청 응답', type: AdminStandardResponsesDto })
    standardResponses: AdminStandardResponsesDto;

    @ApiProperty({ description: '커스텀 질문 응답', type: [AdminCustomResponseDto] })
    customResponses: AdminCustomResponseDto[];

    @ApiProperty({ description: '신청 접수 일시' })
    appliedAt: Date;

    @ApiProperty({ description: '처리 완료 일시', required: false })
    processedAt?: Date;

    @ApiProperty({ description: '브리더 메모', required: false })
    breederNotes?: string;
}
