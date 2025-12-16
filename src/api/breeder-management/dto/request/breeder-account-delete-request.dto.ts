import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

/**
 * 브리더 회원 탈퇴 사유 (Figma 디자인 기준)
 */
export enum BreederWithdrawReason {
    NO_INQUIRY = 'no_inquiry', // 입양 문의가 잘 오지 않았어요
    TIME_CONSUMING = 'time_consuming', // 운영이 생각보다 번거롭거나 시간이 부족해요
    VERIFICATION_DIFFICULT = 'verification_difficult', // 브리더 심사나 검증 절차가 어려웠어요
    POLICY_MISMATCH = 'policy_mismatch', // 수익 구조나 서비스 정책이 잘 맞지 않아요
    UNCOMFORTABLE_UI = 'uncomfortable_ui', // 사용하기 불편했어요 (UI/기능 등)
    OTHER = 'other', // 다른 이유로 탈퇴하고 싶어요
}

/**
 * 브리더 회원 탈퇴 요청 DTO
 */
export class BreederAccountDeleteRequestDto {
    /**
     * 탈퇴 사유
     * @example "no_inquiry"
     */
    @ApiProperty({
        description: '브리더 탈퇴 사유',
        enum: BreederWithdrawReason,
        example: BreederWithdrawReason.NO_INQUIRY,
    })
    @IsEnum(BreederWithdrawReason)
    reason: BreederWithdrawReason;

    /**
     * 기타 사유 (reason이 'other'일 때 필수)
     * @example "다른 플랫폼으로 이전했습니다"
     */
    @ApiProperty({
        description: '기타 탈퇴 사유 (reason이 other일 때)',
        required: false,
        example: '다른 플랫폼으로 이전했습니다',
    })
    @IsString()
    @IsOptional()
    otherReason?: string;
}
