import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

const toBoolean = ({ value }: { value: unknown }): unknown => {
    if (typeof value === 'string') {
        if (value === 'true') return true;
        if (value === 'false') return false;
    }
    return value;
};

/**
 * v2 입양 신청 폼 (Figma 122:3) 요청 DTO.
 *
 * petId 는 URL/이전 화면에서 결정되어 폼이 자동 채움. body 에서는 form 입력만 받음.
 * cross-field 정책(동의 false / 빈 텍스트)은 AdoptionApplicationValidatorService 가 강제.
 */
export class CreateAdoptionApplicationRequestDto {
    @ApiProperty({ description: '분양 펫 ID', example: '507f1f77bcf86cd799439011' })
    @IsString()
    @IsNotEmpty()
    petId: string;

    @ApiProperty({ description: '입양 계획 (최대 1500자)', example: '생활패턴/주거환경/입양 시기 등...' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1500)
    adoptionPlan: string;

    @ApiProperty({ description: '가족 구성원', example: '배우자 1명, 자녀 1명, 부모님 1명' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    familyMembers: string;

    @ApiProperty({ description: '개인정보 수집 및 이용 동의', example: true })
    @Type(() => Boolean)
    @Transform(toBoolean)
    @IsBoolean()
    privacyConsent: boolean;

    @ApiProperty({ description: '정기 예방접종/건강검진/훈련 등 기본 케어 가능', example: true })
    @Type(() => Boolean)
    @Transform(toBoolean)
    @IsBoolean()
    basicCareConsent: boolean;

    @ApiProperty({ description: '예상치 못한 질병/사고 치료비 감당 가능', example: true })
    @Type(() => Boolean)
    @Transform(toBoolean)
    @IsBoolean()
    emergencyCareConsent: boolean;

    @ApiProperty({ description: '모든 가족 구성원이 입양에 동의했음', example: true })
    @Type(() => Boolean)
    @Transform(toBoolean)
    @IsBoolean()
    allFamilyConsent: boolean;
}
