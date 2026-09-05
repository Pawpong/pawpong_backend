import { ApiProperty } from '@nestjs/swagger';

/**
 * 탈퇴 사용자 응답 DTO
 */
export class DeletedUserResponseDto {
    /**
     * 사용자 고유 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '사용자 고유 ID',
        example: '507f1f77bcf86cd799439011',
    })
    userId: string;

    /**
     * 이메일
     * @example "user@example.com"
     */
    @ApiProperty({
        description: '이메일',
        example: 'user@example.com',
    })
    email: string;

    /**
     * 닉네임
     * @example "홍길동"
     */
    @ApiProperty({
        description: '닉네임',
        example: '홍길동',
    })
    nickname: string;

    /**
     * 사용자 역할
     * @example "adopter"
     */
    @ApiProperty({
        description: '사용자 역할',
        enum: ['adopter', 'breeder'],
        example: 'adopter',
    })
    userRole: 'adopter' | 'breeder';

    /**
     * 탈퇴 사유
     * @example "already_adopted"
     */
    @ApiProperty({
        description: '탈퇴 사유',
        example: 'already_adopted',
    })
    deleteReason: string;

    /**
     * 탈퇴 상세 사유 (기타 선택 시)
     * @example "다른 플랫폼에서 입양했습니다"
     */
    @ApiProperty({
        description: '탈퇴 상세 사유',
        required: false,
        example: '다른 플랫폼에서 입양했습니다',
    })
    deleteReasonDetail?: string;

    /**
     * 탈퇴 일시
     * @example "2025-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '탈퇴 일시',
        example: '2025-01-15T10:30:00.000Z',
    })
    deletedAt: string;

    /**
     * 가입 일시
     * @example "2024-12-01T10:30:00.000Z"
     */
    @ApiProperty({
        description: '가입 일시',
        example: '2024-12-01T10:30:00.000Z',
    })
    createdAt: string;

    /**
     * 전화번호
     * @example "010-1234-5678"
     */
    @ApiProperty({
        description: '전화번호',
        required: false,
        example: '010-1234-5678',
    })
    phone?: string;
}
