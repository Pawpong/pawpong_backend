import { ApiProperty } from '@nestjs/swagger';
import type { UserAdminManagedUserRole } from '../../application/ports/user-admin-reader.port';

export class UserManagementStatisticsResponseDto {
    @ApiProperty({ description: '총 입양 신청 수', example: 10, required: false })
    totalApplications?: number;

    @ApiProperty({ description: '총 찜 수', example: 25, required: false })
    totalFavorites?: number;

    @ApiProperty({ description: '완료된 입양 수', example: 4, required: false })
    completedAdoptions?: number;

    @ApiProperty({ description: '평균 평점', example: 4.8, required: false })
    averageRating?: number;

    @ApiProperty({ description: '총 후기 수', example: 12, required: false })
    totalReviews?: number;

    @ApiProperty({ description: '프로필 조회 수', example: 320, required: false })
    profileViews?: number;

    @ApiProperty({
        description: '통계 마지막 업데이트 시각',
        example: '2024-01-15T10:30:00.000Z',
        format: 'date-time',
        required: false,
    })
    lastUpdated?: Date;
}

/**
 * 사용자 관리 정보 응답 DTO
 * 관리자가 조회하는 사용자 정보를 제공합니다.
 */
export class UserManagementResponseDto {
    /**
     * 사용자 고유 ID
     * @example "507f1f77bcf86cd799439022"
     */
    @ApiProperty({
        description: '사용자 고유 ID',
        example: '507f1f77bcf86cd799439022',
    })
    userId: string;

    /**
     * 사용자 실명
     * @example "박입양자"
     */
    @ApiProperty({
        description: '사용자 실명',
        example: '박입양자',
    })
    userName: string;

    /**
     * 사용자 이메일
     * @example "adopter@example.com"
     */
    @ApiProperty({
        description: '사용자 이메일',
        example: 'adopter@example.com',
    })
    emailAddress: string;

    /**
     * 사용자 역할 (입양자/브리더)
     * @example "adopter"
     */
    @ApiProperty({
        description: '사용자 역할',
        example: 'adopter',
        enum: ['adopter', 'breeder'],
    })
    userRole: UserAdminManagedUserRole;

    /**
     * 계정 상태
     * @example "active"
     */
    @ApiProperty({
        description: '계정 상태',
        example: 'active',
        enum: ['active', 'suspended', 'deactivated'],
    })
    accountStatus: string;

    /**
     * 최근 로그인 일시
     * @example "2024-01-15T14:20:00.000Z"
     */
    @ApiProperty({
        description: '최근 로그인 일시',
        example: '2024-01-15T14:20:00.000Z',
        format: 'date-time',
    })
    lastLoginAt: Date;

    /**
     * 계정 생성 일시
     * @example "2024-01-01T12:00:00.000Z"
     */
    @ApiProperty({
        description: '계정 생성 일시',
        example: '2024-01-01T12:00:00.000Z',
        format: 'date-time',
    })
    createdAt: Date;

    /**
     * 사용자 통계 정보 (선택사항)
     */
    @ApiProperty({
        description: '사용자 통계 정보',
        required: false,
        type: () => UserManagementStatisticsResponseDto,
    })
    statisticsInfo?: UserManagementStatisticsResponseDto;
}
