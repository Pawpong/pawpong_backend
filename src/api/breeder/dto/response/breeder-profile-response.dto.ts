import { ApiProperty } from '@nestjs/swagger';
import { PriceDisplayType } from '../../../../common/enum/user.enum';

/**
 * 브리더 프로필 위치 정보 DTO
 */
export class BreederLocationDto {
    /**
     * 도시명
     * @example "서울"
     */
    @ApiProperty({
        description: '도시명',
        example: '서울',
    })
    cityName: string;

    /**
     * 구/군명
     * @example "강남구"
     */
    @ApiProperty({
        description: '구/군명',
        example: '강남구',
    })
    districtName: string;

    /**
     * 상세 주소 (선택사항)
     * @example "테헤란로 123"
     */
    @ApiProperty({
        description: '상세 주소',
        example: '테헤란로 123',
        required: false,
    })
    detailAddress?: string;
}

/**
 * 브리더 가격대 정보 DTO
 */
export class BreederPriceRangeDto {
    /**
     * 최소 가격 (원)
     * @example 500000
     */
    @ApiProperty({
        description: '최소 가격 (원)',
        example: 500000,
    })
    min: number;

    /**
     * 최대 가격 (원)
     * @example 2000000
     */
    @ApiProperty({
        description: '최대 가격 (원)',
        example: 2000000,
    })
    max: number;

    /**
     * 가격 표시 타입
     * - not_set: 가격 미설정 (min: 0, max: 0)
     * - consultation: 상담 후 공개 (min: 0, max: 0)
     * - range: 가격 범위 표시 (min > 0, max > 0)
     * @example "consultation"
     */
    @ApiProperty({
        description: '가격 표시 타입',
        example: 'consultation',
        enum: PriceDisplayType,
    })
    display: PriceDisplayType;
}

/**
 * 브리더 프로필 정보 DTO
 */
export class BreederProfileInfoDto {
    /**
     * 브리더 소개 설명
     * @example "20년 경력의 전문 브리더입니다"
     */
    @ApiProperty({
        description: '브리더 소개 설명',
        example: '20년 경력의 전문 브리더입니다',
    })
    profileDescription: string;

    /**
     * 위치 정보
     */
    @ApiProperty({
        description: '위치 정보',
        type: BreederLocationDto,
    })
    locationInfo: BreederLocationDto;

    /**
     * 브리더 사진 URL 배열
     * @example ["https://example.com/photo1.jpg"]
     */
    @ApiProperty({
        description: '브리더 사진 URL 배열',
        example: ['https://example.com/photo1.jpg'],
        type: [String],
    })
    profilePhotos: string[];

    /**
     * 분양 가격대 정보
     */
    @ApiProperty({
        description: '분양 가격대 정보',
        type: BreederPriceRangeDto,
    })
    priceRangeInfo: BreederPriceRangeDto;

    /**
     * 전문 분야 (품종)
     * @example ["골든 리트리버", "래브라도"]
     */
    @ApiProperty({
        description: '전문 분야 (품종)',
        example: ['골든 리트리버', '래브라도'],
        type: [String],
    })
    specializationAreas: string[];

    /**
     * 경력 연수
     * @example 20
     */
    @ApiProperty({
        description: '경력 연수',
        example: 20,
        required: false,
    })
    experienceYears?: number;
}

/**
 * 브리더 통계 정보 DTO
 */
export class BreederStatsDto {
    /**
     * 총 신청 수
     * @example 150
     */
    @ApiProperty({
        description: '총 신청 수',
        example: 150,
    })
    totalApplicationCount: number;

    /**
     * 성사된 입양 수
     * @example 85
     */
    @ApiProperty({
        description: '성사된 입양 수',
        example: 85,
    })
    completedAdoptionCount: number;

    /**
     * 평균 평점
     * @example 4.5
     */
    @ApiProperty({
        description: '평균 평점',
        example: 4.5,
    })
    averageRatingScore: number;

    /**
     * 총 후기 수
     * @example 42
     */
    @ApiProperty({
        description: '총 후기 수',
        example: 42,
    })
    totalReviewCount: number;

    /**
     * 프로필 조회수
     * @example 1250
     */
    @ApiProperty({
        description: '프로필 조회수',
        example: 1250,
    })
    profileViewCount: number;
}

/**
 * 브리더 인증 정보 DTO
 */
export class BreederVerificationDto {
    /**
     * 인증 상태
     * @example "approved"
     */
    @ApiProperty({
        description: '인증 상태',
        example: 'approved',
        enum: ['pending', 'approved', 'rejected'],
    })
    verificationStatus: string;
}

export class BreederProfileParentPetInfoDto {
    @ApiProperty({ description: '부모견/묘 ID', example: '507f1f77bcf86cd799439011' })
    id: string;

    @ApiProperty({ description: '대표 이미지 URL', example: 'https://example.com/parent.jpg' })
    avatarUrl: string;

    @ApiProperty({ description: '이름', example: '루비' })
    name: string;

    @ApiProperty({ description: '성별', example: 'female' })
    sex: string;

    @ApiProperty({ description: '출생 정보', example: '2022년 3월생' })
    birth: string;

    @ApiProperty({ description: '품종', example: '골든 리트리버' })
    breed: string;

    @ApiProperty({ description: '사진 목록', type: [String], example: ['https://example.com/parent-1.jpg'] })
    photos: string[];
}

export class BreederProfileAvailablePetInfoDto {
    @ApiProperty({ description: '개체 ID', example: '507f1f77bcf86cd799439012' })
    petId: string;

    @ApiProperty({ description: '이름', example: '콩이' })
    name: string;

    @ApiProperty({ description: '품종', example: '골든 리트리버' })
    breed: string;

    @ApiProperty({ description: '성별', example: 'male' })
    gender: string;

    @ApiProperty({ description: '출생일', example: '2024-01-01T00:00:00.000Z', required: false })
    birthDate?: Date;

    @ApiProperty({ description: '가격', example: 1500000, required: false })
    price?: number;

    @ApiProperty({ description: '상태', example: 'available', required: false })
    status?: string;

    @ApiProperty({ description: '소개', example: '활발한 성격의 아이입니다.' })
    description: string;

    @ApiProperty({ description: '대표 사진', example: 'https://example.com/pet-main.jpg' })
    photo: string;

    @ApiProperty({ description: '사진 목록', type: [String], example: ['https://example.com/pet-1.jpg'] })
    photos: string[];

    @ApiProperty({ description: '부모견/묘 정보', type: () => [BreederProfileParentPetInfoDto] })
    parents: BreederProfileParentPetInfoDto[];
}

export class BreederProfileReviewInfoDto {
    @ApiProperty({ description: '후기 ID', example: 'review_123', required: false })
    reviewId?: string;

    @ApiProperty({ description: '작성일', example: '2024-01-01T00:00:00.000Z', required: false })
    writtenAt?: Date;

    @ApiProperty({ description: '후기 타입', example: 'completed', required: false })
    type?: string;

    @ApiProperty({ description: '입양자 이름', example: '김입양자', required: false })
    adopterName?: string;

    @ApiProperty({ description: '평점', example: 5, required: false })
    rating?: number;

    @ApiProperty({ description: '후기 내용', example: '상담이 정말 친절했어요.', required: false })
    content?: string;

    @ApiProperty({ description: '대표 사진', example: 'https://example.com/review.jpg', required: false })
    photo?: string;
}

/**
 * 브리더 프로필 응답 DTO
 * 브리더 상세 정보 조회 시 반환되는 데이터 구조입니다.
 */
export class BreederProfileResponseDto {
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
     * @example "김브리더"
     */
    @ApiProperty({
        description: '브리더 이름',
        example: '김브리더',
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
    breederEmail: string;

    /**
     * 프로필 이미지 URL
     * @example "https://example.com/profile.jpg"
     */
    @ApiProperty({
        description: '프로필 이미지 URL',
        example: 'https://example.com/profile.jpg',
        required: false,
    })
    profileImageFileName?: string;

    /**
     * 소셜 로그인 제공자
     * @example "kakao"
     */
    @ApiProperty({
        description: '소셜 로그인 제공자',
        example: 'kakao',
        enum: ['local', 'google', 'kakao', 'naver', 'apple'],
    })
    authProvider: string;

    /**
     * 반려동물 타입
     * @example "dog"
     */
    @ApiProperty({
        description: '반려동물 타입',
        example: 'dog',
        enum: ['dog', 'cat'],
    })
    petType: string;

    /**
     * 브리더 프로필 상세 정보
     */
    @ApiProperty({
        description: '브리더 프로필 상세 정보',
        type: BreederProfileInfoDto,
    })
    profileInfo: BreederProfileInfoDto;

    /**
     * 부모견/부모묘 정보
     * @example []
     */
    @ApiProperty({
        description: '부모견/부모묘 정보',
        type: () => [BreederProfileParentPetInfoDto],
    })
    parentPetInfo: BreederProfileParentPetInfoDto[];

    /**
     * 분양 가능한 반려동물 정보
     * @example []
     */
    @ApiProperty({
        description: '분양 가능한 반려동물 정보',
        type: () => [BreederProfileAvailablePetInfoDto],
    })
    availablePetInfo: BreederProfileAvailablePetInfoDto[];

    /**
     * 후기 정보
     * @example []
     */
    @ApiProperty({
        description: '후기 정보',
        type: () => [BreederProfileReviewInfoDto],
    })
    reviewInfo: BreederProfileReviewInfoDto[];

    /**
     * 브리더 통계 정보
     */
    @ApiProperty({
        description: '브리더 통계 정보',
        type: BreederStatsDto,
    })
    statsInfo: BreederStatsDto;

    /**
     * 브리더 인증 정보
     */
    @ApiProperty({
        description: '브리더 인증 정보',
        type: BreederVerificationDto,
    })
    verificationInfo: BreederVerificationDto;

    /**
     * 상담 신청 알림톡 수신 동의
     * @example true
     */
    @ApiProperty({
        description: '상담 신청 알림톡 수신 동의',
        example: true,
        required: false,
    })
    consultationAgreed?: boolean;
}
