import { ApiProperty } from '@nestjs/swagger';

/**
 * 서류 정보 DTO
 */
export class DocumentInfoDto {
    /**
     * 서류 타입
     * @example "id_card"
     */
    @ApiProperty({
        description: '서류 타입',
        example: 'id_card',
    })
    type: string;

    /**
     * 파일명
     * @example "id_card.pdf"
     */
    @ApiProperty({
        description: '파일명',
        example: 'id_card.pdf',
    })
    fileName: string;

    /**
     * 파일 URL
     * @example "https://storage.pawpong.com/documents/id_card.pdf"
     */
    @ApiProperty({
        description: '파일 URL',
        example: 'https://storage.pawpong.com/documents/id_card.pdf',
        required: false,
    })
    fileUrl?: string;

    /**
     * 업로드 일시
     * @example "2024-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '업로드 일시',
        example: '2024-01-15T10:30:00.000Z',
    })
    uploadedAt: Date;
}

/**
 * 브리더 상세 정보 응답 DTO
 */
export class BreederDetailResponseDto {
    /**
     * 브리더 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '브리더 ID',
        example: '507f1f77bcf86cd799439011',
    })
    breederId: string;

    /**
     * 이메일
     * @example "breeder@example.com"
     */
    @ApiProperty({
        description: '이메일',
        example: 'breeder@example.com',
    })
    email: string;

    /**
     * 닉네임
     * @example "강아지 사랑"
     */
    @ApiProperty({
        description: '닉네임',
        example: '강아지 사랑',
    })
    nickname: string;

    /**
     * 전화번호
     * @example "010-1234-5678"
     */
    @ApiProperty({
        description: '전화번호',
        example: '010-1234-5678',
        required: false,
    })
    phone?: string;

    /**
     * 사업자 번호
     * @example "123-45-67890"
     */
    @ApiProperty({
        description: '사업자 번호',
        example: '123-45-67890',
        required: false,
    })
    businessNumber?: string;

    /**
     * 사업자명
     * @example "포퐁 브리더"
     */
    @ApiProperty({
        description: '사업자명',
        example: '포퐁 브리더',
        required: false,
    })
    businessName?: string;

    /**
     * 인증 정보
     */
    @ApiProperty({
        description: '인증 정보',
    })
    verificationInfo: {
        /**
         * 인증 상태
         */
        verificationStatus: string;

        /**
         * 구독 플랜
         */
        subscriptionPlan: string;

        /**
         * 브리더 레벨 (new: 뉴, elite: 엘리트)
         */
        level: string;

        /**
         * 신청일
         */
        submittedAt?: Date;

        /**
         * 승인/거절일
         */
        processedAt?: Date;

        /**
         * 이메일로 제출 여부
         */
        isSubmittedByEmail?: boolean;

        /**
         * 제출된 서류 목록
         */
        documents?: DocumentInfoDto[];

        /**
         * 거절 사유
         */
        rejectionReason?: string;
    };

    /**
     * 프로필 정보
     */
    @ApiProperty({
        description: '프로필 정보',
        required: false,
    })
    profileInfo?: {
        /**
         * 지역
         */
        location?: string;

        /**
         * 세부 지역
         */
        detailedLocation?: string;

        /**
         * 전문 분야
         */
        specialization?: string[];

        /**
         * 브리딩 품종 목록
         */
        breeds?: string[];

        /**
         * 소개
         */
        description?: string;

        /**
         * 경력 (년)
         */
        experienceYears?: number;
    };

    /**
     * 계정 생성일
     * @example "2024-01-01T00:00:00.000Z"
     */
    @ApiProperty({
        description: '계정 생성일',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    /**
     * 마지막 수정일
     * @example "2024-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '마지막 수정일',
        example: '2024-01-15T10:30:00.000Z',
    })
    updatedAt: Date;
}
