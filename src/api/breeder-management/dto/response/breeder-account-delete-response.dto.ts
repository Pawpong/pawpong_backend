import { ApiProperty } from '@nestjs/swagger';

/**
 * 브리더 회원 탈퇴 응답 DTO
 */
export class BreederAccountDeleteResponseDto {
    /**
     * 탈퇴한 브리더 ID
     * @example "507f1f77bcf86cd799439011"
     */
    @ApiProperty({
        description: '탈퇴한 브리더 ID',
        example: '507f1f77bcf86cd799439011',
    })
    breederId: string;

    /**
     * 탈퇴 처리 일시 (ISO 8601 형식)
     * @example "2025-12-16T10:30:00.000Z"
     */
    @ApiProperty({
        description: '탈퇴 처리 일시',
        example: '2025-12-16T10:30:00.000Z',
    })
    deletedAt: string;

    /**
     * 처리 결과 메시지
     * @example "브리더 회원 탈퇴가 성공적으로 처리되었습니다."
     */
    @ApiProperty({
        description: '처리 결과 메시지',
        example: '브리더 회원 탈퇴가 성공적으로 처리되었습니다.',
    })
    message: string;
}
