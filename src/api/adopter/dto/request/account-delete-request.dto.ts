import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

/**
 * 입양자 회원 탈퇴 사유 (Figma 디자인 기준)
 */
export enum AdopterWithdrawReason {
    ALREADY_ADOPTED = 'already_adopted', // 이미 입양을 마쳤어요
    NO_SUITABLE_PET = 'no_suitable_pet', // 마음에 드는 아이가 없어요
    ADOPTION_FEE_BURDEN = 'adoption_fee_burden', // 입양비가 부담돼요
    UNCOMFORTABLE_UI = 'uncomfortable_ui', // 사용하기 불편했어요 (UI/기능 등)
    PRIVACY_CONCERN = 'privacy_concern', // 개인정보나 보안이 걱정돼요
    OTHER = 'other', // 다른 이유로 탈퇴하고 싶어요
}

/**
 * 입양자 회원 탈퇴 요청 DTO
 */
export class AccountDeleteRequestDto {
    /**
     * 탈퇴 사유
     * @example "already_adopted"
     */
    @ApiProperty({
        description: '입양자 탈퇴 사유',
        enum: AdopterWithdrawReason,
        example: AdopterWithdrawReason.ALREADY_ADOPTED,
    })
    @IsEnum(AdopterWithdrawReason)
    reason: AdopterWithdrawReason;

    /**
     * 기타 사유 (reason이 'other'일 때 필수)
     * @example "다른 플랫폼에서 입양을 완료했습니다"
     */
    @ApiProperty({
        description: '기타 탈퇴 사유 (reason이 other일 때)',
        required: false,
        example: '다른 플랫폼에서 입양을 완료했습니다',
    })
    @IsString()
    @IsOptional()
    otherReason?: string;
}
