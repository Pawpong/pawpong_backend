import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { VerificationStatus } from '../../../../../common/enum/user.enum';

/**
 * 브리더 인증 승인/거절 요청 DTO
 */
export class BreederVerificationRequestDto {
    /**
     * 인증 상태 (approved/rejected)
     * @example "approved"
     */
    @ApiProperty({
        description: '인증 상태',
        example: 'approved',
        enum: [VerificationStatus.APPROVED, VerificationStatus.REJECTED],
    })
    @IsEnum([VerificationStatus.APPROVED, VerificationStatus.REJECTED])
    verificationStatus: VerificationStatus;

    /**
     * 거절 사유 (거절 시 필수)
     * @example "서류가 불완전합니다."
     */
    @ApiProperty({
        description: '거절 사유 (거절 시 필수)',
        example: '서류가 불완전합니다.',
        required: false,
    })
    @IsOptional()
    @IsString()
    rejectionReason?: string;
}
