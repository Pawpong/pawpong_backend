import { ApiProperty } from '@nestjs/swagger';

/**
 * 회원 탈퇴 응답 DTO
 */
export class AccountDeleteResponseDto {
    /**
     * 탈퇴된 사용자 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '탈퇴된 사용자 ID',
        example: '507f1f77bcf86cd799439011',
    })
    adopterId: string;

    /**
     * 탈퇴 처리 일시
     * @example "2025-01-15T10:30:00.000Z"
     */
    @ApiProperty({
        description: '탈퇴 처리 일시',
        example: '2025-01-15T10:30:00.000Z',
    })
    deletedAt: string;

    /**
     * 성공 메시지
     * @example "회원 탈퇴가 완료되었습니다."
     */
    @ApiProperty({
        description: '성공 메시지',
        example: '회원 탈퇴가 완료되었습니다.',
    })
    message: string;
}
