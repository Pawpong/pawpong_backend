import { ApiProperty } from '@nestjs/swagger';

export class BreederVerificationProfileLocationDto {
    @ApiProperty({ description: '도시명', example: '서울', required: false })
    cityName?: string;

    @ApiProperty({ description: '구/군명', example: '강남구', required: false })
    districtName?: string;

    @ApiProperty({ description: '상세 주소', example: '테헤란로 123', required: false })
    detailAddress?: string;
}

export class BreederVerificationProfileInfoDto {
    @ApiProperty({
        description: '위치 정보',
        type: () => BreederVerificationProfileLocationDto,
        required: false,
    })
    locationInfo?: BreederVerificationProfileLocationDto;

    @ApiProperty({
        description: '전문 분야',
        type: [String],
        example: ['골든 리트리버'],
        required: false,
    })
    specialization?: string[];

    @ApiProperty({
        description: '소개글',
        example: '20년 경력의 전문 브리더입니다.',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: '경력 연수',
        example: 20,
        required: false,
    })
    experienceYears?: number;
}

/**
 * 브리더 인증 정보 응답 DTO
 */
export class BreederVerificationResponseDto {
    /**
     * 브리더 고유 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '브리더 고유 ID',
        example: '507f1f77bcf86cd799439011',
    })
    breederId: string;

    /**
     * 브리더 이름
     * @example "김철수"
     */
    @ApiProperty({
        description: '브리더 이름',
        example: '김철수',
    })
    breederName: string;

    /**
     * 브리더 이메일
     * @example "breeder@example.com"
     */
    @ApiProperty({
        description: '브리더 이메일',
        example: 'breeder@example.com',
    })
    emailAddress: string;

    /**
     * 브리더 전화번호
     * @example "010-1234-5678"
     */
    @ApiProperty({
        description: '브리더 전화번호',
        example: '010-1234-5678',
        required: false,
    })
    phoneNumber?: string;

    /**
     * 계정 상태
     * @example "active"
     */
    @ApiProperty({
        description: '계정 상태',
        example: 'active',
        enum: ['active', 'suspended', 'deleted'],
        required: false,
    })
    accountStatus?: string;

    /**
     * 테스트 계정 여부
     * 테스트 계정은 탐색 페이지와 홈 화면에 노출되지 않습니다.
     * @example false
     */
    @ApiProperty({
        description: '테스트 계정 여부',
        example: false,
        required: false,
    })
    isTestAccount?: boolean;

    /**
     * 인증 정보
     */
    @ApiProperty({
        description: '인증 정보',
    })
    verificationInfo: {
        verificationStatus: string;
        subscriptionPlan: string;
        level: string;
        submittedAt?: Date;
        isSubmittedByEmail?: boolean;
        previousLevel?: string; // 레벨 변경 시 이전 레벨
        isLevelChange?: boolean; // 레벨 변경 신청 여부
    };

    /**
     * 브리더 프로필 정보
     */
    @ApiProperty({
        description: '브리더 프로필 정보',
        required: false,
        type: () => BreederVerificationProfileInfoDto,
    })
    profileInfo?: BreederVerificationProfileInfoDto;

    /**
     * 계정 생성 일시
     * @example "2024-01-10T08:15:00.000Z"
     */
    @ApiProperty({
        description: '계정 생성 일시',
        example: '2024-01-10T08:15:00.000Z',
    })
    createdAt: Date;
}
