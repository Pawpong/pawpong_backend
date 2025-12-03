import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

/**
 * 회원 탈퇴 사유
 */
export enum WithdrawReason {
    SERVICE_DISSATISFACTION = 'service_dissatisfaction', // 서비스 불만족
    PRIVACY_CONCERN = 'privacy_concern', // 개인정보 우려
    LOW_USAGE = 'low_usage', // 이용 빈도 낮음
    ADOPTION_COMPLETED = 'adoption_completed', // 분양 완료
    OTHER = 'other', // 기타
}

/**
 * 회원 탈퇴 요청 DTO
 */
export class AccountDeleteRequestDto {
    /**
     * 탈퇴 사유
     * @example "service_dissatisfaction"
     */
    @ApiProperty({
        description: '탈퇴 사유',
        enum: WithdrawReason,
        example: WithdrawReason.SERVICE_DISSATISFACTION,
    })
    @IsEnum(WithdrawReason)
    reason: WithdrawReason;

    /**
     * 기타 사유 (reason이 'other'일 때 필수)
     * @example "원하는 품종을 찾지 못했습니다"
     */
    @ApiProperty({
        description: '기타 탈퇴 사유 (reason이 other일 때)',
        required: false,
        example: '원하는 품종을 찾지 못했습니다',
    })
    @IsString()
    @IsOptional()
    otherReason?: string;
}
