import { ApiProperty } from '@nestjs/swagger';

/**
 * 신청 폼 데이터 (입양자 조회용)
 *
 * 입양자가 자신이 작성한 신청 폼 내용을 확인할 수 있습니다.
 */
export class ApplicationFormDataDto {
    /**
     * 개인정보 수집 및 이용 동의 여부
     * @example true
     */
    @ApiProperty({
        description: '개인정보 수집 및 이용 동의 여부',
        example: true,
    })
    privacyConsent: boolean;

    /**
     * 자기소개
     * @example "안녕하세요. 30대 남성이며 서울 강남구에 거주하고 있습니다."
     */
    @ApiProperty({
        description: '자기소개 (성별, 연령대, 거주지, 생활 패턴 등)',
        example: '안녕하세요. 30대 남성이며 서울 강남구에 거주하고 있습니다.',
        required: false,
    })
    selfIntroduction?: string;

    /**
     * 함께 거주하는 가족 구성원 정보
     * @example "총 3명 - 본인(30대), 배우자(30대), 자녀(5세)"
     */
    @ApiProperty({
        description: '가족 구성원 정보',
        example: '총 3명 - 본인(30대), 배우자(30대), 자녀(5세)',
    })
    familyMembers: string;

    /**
     * 모든 가족 구성원의 입양 동의 여부
     * @example true
     */
    @ApiProperty({
        description: '모든 가족 구성원의 입양 동의 여부',
        example: true,
    })
    allFamilyConsent: boolean;

    /**
     * 알러지 검사 정보
     * @example "본인과 배우자 모두 알러지 검사 완료했으며, 반려동물 알러지 없음"
     */
    @ApiProperty({
        description: '알러지 검사 정보',
        example: '본인과 배우자 모두 알러지 검사 완료했으며, 반려동물 알러지 없음',
        required: false,
    })
    allergyTestInfo?: string;

    /**
     * 평균적으로 집을 비우는 시간
     * @example "주중 9시간(오전 9시~오후 6시), 주말 집에 있음"
     */
    @ApiProperty({
        description: '집을 비우는 시간',
        example: '주중 9시간(오전 9시~오후 6시), 주말 집에 있음',
        required: false,
    })
    timeAwayFromHome?: string;

    /**
     * 반려동물과 함께 지낼 공간 소개
     * @example "거실과 안방을 자유롭게 이용할 수 있습니다."
     */
    @ApiProperty({
        description: '거주 공간 소개',
        example: '거실과 안방을 자유롭게 이용할 수 있습니다.',
        required: false,
    })
    livingSpaceDescription?: string;

    /**
     * 현재/이전 반려동물 정보
     * @example "5년 전 고양이 한 마리를 키웠습니다."
     */
    @ApiProperty({
        description: '반려동물 경험',
        example: '5년 전 고양이 한 마리를 키웠습니다.',
        required: false,
    })
    previousPetExperience?: string;

    @ApiProperty({ description: '기본 케어 책임 가능 여부', example: true })
    canProvideBasicCare: boolean;

    @ApiProperty({ description: '예상치 못한 치료비 감당 가능 여부', example: true })
    canAffordMedicalExpenses: boolean;

    @ApiProperty({
        description: '마음에 둔 아이 또는 원하는 특징',
        example: '중형견, 차분한 성격',
        required: false,
    })
    preferredPetDescription?: string;

    @ApiProperty({ description: '원하는 입양 시기', example: '3개월 이내', required: false })
    desiredAdoptionTiming?: string;

    @ApiProperty({
        description: '추가 문의사항 또는 남기고 싶은 말',
        example: '방문 상담 가능 시간을 알려주세요.',
        required: false,
    })
    additionalNotes?: string;

    @ApiProperty({
        description: '간소화된 입양 계획',
        example: '생활패턴, 주거환경, 입양 시기를 포함한 계획입니다.',
        required: false,
    })
    adoptionPlan?: string;
}

export class ApplicationCustomResponseDto {
    @ApiProperty({ description: '질문 ID', example: 'custom_1' })
    questionId: string;

    @ApiProperty({ description: '질문 문구 스냅샷', example: '방문 가능한 시간대는 언제인가요?' })
    questionLabel: string;

    @ApiProperty({ description: '질문 유형', example: 'select' })
    questionType: string;

    @ApiProperty({
        description: '응답 값',
        oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
        example: '주말 오후',
    })
    answer: string | string[];
}

/**
 * 입양 신청 상세 응답 DTO
 *
 * 입양자가 자신이 보낸 입양 신청의 상세 정보를 조회할 때 사용됩니다.
 */
export class ApplicationDetailResponseDto {
    /**
     * 입양 신청 고유 ID
     * @example "507f1f77bcf86cd799439088"
     */
    @ApiProperty({
        description: '입양 신청 고유 ID',
        example: '507f1f77bcf86cd799439088',
    })
    applicationId: string;

    @ApiProperty({
        description: '이 신청으로 작성한 후기 ID (후기가 없으면 null)',
        example: '507f1f77bcf86cd799439077',
        nullable: true,
    })
    reviewId: string | null;

    /**
     * 신청한 브리더 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '신청한 브리더 ID',
        example: '507f1f77bcf86cd799439011',
    })
    breederId: string;

    /**
     * 브리더 이름
     * @example "행복한 브리더"
     */
    @ApiProperty({
        description: '브리더 이름',
        example: '행복한 브리더',
    })
    breederName: string;

    /**
     * 신청한 반려동물 ID (있는 경우)
     * @example "507f1f77bcf86cd799439099"
     */
    @ApiProperty({
        description: '신청한 반려동물 ID',
        example: '507f1f77bcf86cd799439099',
        required: false,
    })
    petId?: string;

    /**
     * 신청한 반려동물 이름 (있는 경우)
     * @example "루이"
     */
    @ApiProperty({
        description: '신청한 반려동물 이름',
        example: '루이',
        required: false,
    })
    petName?: string;

    /**
     * 신청 처리 상태
     * @example "consultation_pending"
     */
    @ApiProperty({
        description: '신청 처리 상태',
        example: 'consultation_pending',
        enum: ['consultation_pending', 'consultation_completed', 'adoption_approved', 'adoption_rejected'],
    })
    status: string;

    /**
     * 입양 신청서 표준 응답
     */
    @ApiProperty({
        description: '입양 신청서 표준 응답',
        type: ApplicationFormDataDto,
        required: false,
    })
    standardResponses?: ApplicationFormDataDto;

    @ApiProperty({
        description: '브리더가 추가한 질문에 대한 응답',
        type: [ApplicationCustomResponseDto],
    })
    customResponses: ApplicationCustomResponseDto[];

    /**
     * 신청 접수 일시
     * @example "2024-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '신청 접수 일시',
        example: '2024-01-15T10:30:00.000Z',
        format: 'date-time',
    })
    appliedAt: string;

    /**
     * 신청 처리 일시 (처리 완료 시)
     * @example "2024-01-16T15:45:00.000Z"
     */
    @ApiProperty({
        description: '신청 처리 일시',
        example: '2024-01-16T15:45:00.000Z',
        format: 'date-time',
        required: false,
    })
    processedAt?: string;

    /**
     * 브리더 메모 (처리 완료 후 입양자도 확인 가능)
     * @example "면담 일정: 1월 20일 오후 2시"
     */
    @ApiProperty({
        description: '브리더 메모',
        example: '면담 일정: 1월 20일 오후 2시',
        required: false,
    })
    breederNotes?: string;
}
