import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../../../../../common/enum/user.enum';

/**
 * 입양 신청 리스트 아이템 DTO
 */
export class ApplicationListItemDto {
    /**
     * 신청 고유 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '신청 고유 ID',
        example: '507f1f77bcf86cd799439011',
    })
    applicationId: string;

    /**
     * 입양자 이름
     * @example "홍길동"
     */
    @ApiProperty({
        description: '입양자 이름',
        example: '홍길동',
    })
    adopterName: string;

    /**
     * 입양자 이메일
     * @example "adopter@example.com"
     */
    @ApiProperty({
        description: '입양자 이메일',
        example: 'adopter@example.com',
    })
    adopterEmail: string;

    /**
     * 입양자 전화번호
     * @example "010-1234-5678"
     */
    @ApiProperty({
        description: '입양자 전화번호',
        example: '010-1234-5678',
    })
    adopterPhone: string;

    /**
     * 브리더 ID
     * @example "507f1f77bcf86cd799439022"
     */
    @ApiProperty({
        description: '브리더 ID',
        example: '507f1f77bcf86cd799439022',
    })
    breederId: string;

    /**
     * 브리더 이름 (조인)
     * @example "김브리더"
     */
    @ApiProperty({
        description: '브리더 이름',
        example: '김브리더',
    })
    breederName: string;

    /**
     * 반려동물 이름 (있는 경우)
     * @example "포메라니안"
     */
    @ApiProperty({
        description: '반려동물 이름',
        example: '포메라니안',
        required: false,
    })
    petName?: string;

    /**
     * 신청 상태
     * @example "consultation_pending"
     */
    @ApiProperty({
        description: '신청 상태',
        enum: ApplicationStatus,
        example: ApplicationStatus.CONSULTATION_PENDING,
    })
    status: ApplicationStatus;

    /**
     * 신청 접수 일시
     * @example "2026-02-01T10:30:00.000Z"
     */
    @ApiProperty({
        description: '신청 접수 일시',
        example: '2026-02-01T10:30:00.000Z',
    })
    appliedAt: Date;

    /**
     * 브리더 처리 완료 일시
     * @example "2026-02-03T15:20:00.000Z"
     */
    @ApiProperty({
        description: '브리더 처리 완료 일시',
        example: '2026-02-03T15:20:00.000Z',
        required: false,
    })
    processedAt?: Date;
}

/**
 * 입양 신청 리스트 응답 DTO
 */
export class ApplicationListResponseDto {
    /**
     * 입양 신청 리스트
     */
    @ApiProperty({
        description: '입양 신청 리스트',
        type: [ApplicationListItemDto],
    })
    applications: ApplicationListItemDto[];

    /**
     * 전체 아이템 수
     * @example 50
     */
    @ApiProperty({
        description: '전체 아이템 수',
        example: 50,
    })
    totalCount: number;

    /**
     * 상담 대기 건수
     * @example 20
     */
    @ApiProperty({
        description: '상담 대기 건수',
        example: 20,
    })
    pendingCount: number;

    /**
     * 상담 완료 건수
     * @example 15
     */
    @ApiProperty({
        description: '상담 완료 건수',
        example: 15,
    })
    completedCount: number;

    /**
     * 입양 승인 건수
     * @example 10
     */
    @ApiProperty({
        description: '입양 승인 건수',
        example: 10,
    })
    approvedCount: number;

    /**
     * 입양 거절 건수
     * @example 5
     */
    @ApiProperty({
        description: '입양 거절 건수',
        example: 5,
    })
    rejectedCount: number;

    /**
     * 현재 페이지
     * @example 1
     */
    @ApiProperty({
        description: '현재 페이지',
        example: 1,
    })
    currentPage: number;

    /**
     * 페이지당 아이템 수
     * @example 10
     */
    @ApiProperty({
        description: '페이지당 아이템 수',
        example: 10,
    })
    pageSize: number;

    /**
     * 전체 페이지 수
     * @example 5
     */
    @ApiProperty({
        description: '전체 페이지 수',
        example: 5,
    })
    totalPages: number;
}
