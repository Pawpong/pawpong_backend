import { ApiProperty } from '@nestjs/swagger';

export class AdminPermissionResponseDto {
    @ApiProperty({ description: '사용자 관리 권한', example: true, required: false })
    canManageUsers?: boolean;

    @ApiProperty({ description: '브리더 관리 권한', example: true, required: false })
    canManageBreeders?: boolean;

    @ApiProperty({ description: '신고 관리 권한', example: true, required: false })
    canManageReports?: boolean;

    @ApiProperty({ description: '통계 조회 권한', example: true, required: false })
    canViewStatistics?: boolean;

    @ApiProperty({ description: '관리자 관리 권한', example: true, required: false })
    canManageAdmins?: boolean;
}

export class AdminActivityLogResponseDto {
    @ApiProperty({ description: '활동 로그 ID', example: 'log_1234567890' })
    logId: string;

    @ApiProperty({ description: '수행 액션', example: 'view_user_list' })
    action: string;

    @ApiProperty({ description: '대상 유형', example: 'system' })
    targetType: string;

    @ApiProperty({ description: '대상 ID', example: 'system' })
    targetId: string;

    @ApiProperty({ description: '대상 이름', example: '시스템', required: false })
    targetName?: string;

    @ApiProperty({ description: '작업 설명', example: '관리자 프로필을 조회했습니다.' })
    description: string;

    @ApiProperty({
        description: '수행 시각',
        example: '2024-01-15T10:30:00.000Z',
        format: 'date-time',
    })
    performedAt: Date;
}

/**
 * 관리자 프로필 조회 응답 DTO
 * 관리자의 프로필 정보를 반환합니다.
 */
export class AdminProfileResponseDto {
    /**
     * 관리자 사용자 ID
     * @example "507f1f77bcf86cd799439111"
     */
    @ApiProperty({
        description: '관리자 사용자 ID',
        example: '507f1f77bcf86cd799439111',
    })
    id: string;

    /**
     * 이메일
     * @example "admin@pawpong.com"
     */
    @ApiProperty({
        description: '이메일',
        example: 'admin@pawpong.com',
    })
    email: string;

    /**
     * 이름
     * @example "관리자"
     */
    @ApiProperty({
        description: '이름',
        example: '관리자',
    })
    name: string;

    /**
     * 권한
     * @example "admin"
     */
    @ApiProperty({
        description: '관리자 등급',
        example: 'super_admin',
        enum: ['super_admin', 'breeder_admin', 'report_admin', 'stats_admin'],
    })
    adminLevel: string;

    /**
     * 계정 상태
     * @example "active"
     */
    @ApiProperty({
        description: '계정 상태',
        example: 'active',
        enum: ['active', 'deleted', 'suspended'],
    })
    status: string;

    @ApiProperty({
        description: '권한 정보',
        type: () => AdminPermissionResponseDto,
        required: false,
    })
    permissions?: AdminPermissionResponseDto;

    @ApiProperty({
        description: '최근 활동 로그',
        type: () => [AdminActivityLogResponseDto],
        example: [],
    })
    activityLogs: AdminActivityLogResponseDto[];

    @ApiProperty({
        description: '계정 생성일',
        example: '2024-01-01T00:00:00.000Z',
        format: 'date-time',
    })
    createdAt: Date;

    @ApiProperty({
        description: '마지막 로그인 일시',
        example: '2024-01-15T10:30:00.000Z',
        format: 'date-time',
        required: false,
    })
    lastLoginAt?: Date;
}
