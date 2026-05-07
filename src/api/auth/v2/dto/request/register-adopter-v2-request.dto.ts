import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsDateString,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

class TermsAgreementItemDto {
    @ApiProperty({ description: '약관 코드', example: 'service' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ description: '동의 시점의 약관 버전', example: 'v1.0' })
    @IsString()
    @IsNotEmpty()
    version: string;

    @ApiProperty({ description: '동의 시각 (ISO8601)', required: false, example: '2026-05-07T10:00:00.000Z' })
    @IsDateString()
    @IsOptional()
    agreedAt?: string;
}

class CounselDefaultProfileDto {
    @ApiProperty({ description: '자기소개', example: '30대 1인가구, 재택근무 중심...' })
    @IsString()
    @IsNotEmpty()
    selfIntroduction: string;

    @ApiProperty({ description: '평균 집 비우는 시간', required: false, example: '평일 오전 9시~오후 6시' })
    @IsString()
    @IsOptional()
    dailyAbsenceHours?: string;

    @ApiProperty({ description: '거주 공간 소개', required: false, example: '24평 아파트, 거실 위주 생활' })
    @IsString()
    @IsOptional()
    livingSpaceDescription?: string;

    @ApiProperty({ description: '상담용 개인정보 수집 동의 여부', example: true })
    @IsBoolean()
    counselPrivacyAgreed: boolean;
}

/**
 * v2 입양자 회원가입 요청 DTO
 */
export class RegisterAdopterV2RequestDto {
    @ApiProperty({ description: '소셜 로그인 임시 ID', example: 'temp_kakao_4479198661_1759826027884' })
    @IsString()
    @IsNotEmpty()
    tempId: string;

    @ApiProperty({ description: '이메일 주소', example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: '닉네임', example: '펫러버' })
    @IsString()
    @IsNotEmpty()
    nickname: string;

    @ApiProperty({ description: '실명 (상담 시 표시)', example: '홍길동' })
    @IsString()
    @IsNotEmpty()
    realName: string;

    @ApiProperty({ description: '휴대폰 번호 (인증 완료된 번호)', example: '010-1234-5678', required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({
        description: '프로필 이미지 파일 경로 (업로드 API 응답의 fileName)',
        example: 'profiles/uuid.jpg',
        required: false,
    })
    @IsString()
    @IsOptional()
    profileImage?: string;

    @ApiProperty({
        description: '관심 품종 ID 배열',
        example: ['507f1f77bcf86cd799439011'],
        type: [String],
        required: false,
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    interestedBreedIds?: string[];

    @ApiProperty({
        description: '입양 상담용 사전 정보',
        type: CounselDefaultProfileDto,
        required: false,
    })
    @ValidateNested()
    @Type(() => CounselDefaultProfileDto)
    @IsOptional()
    counselDefaultProfile?: CounselDefaultProfileDto;

    @ApiProperty({
        description: '약관 동의 이력 (활성 버전 기준)',
        type: [TermsAgreementItemDto],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => TermsAgreementItemDto)
    termsAgreements: TermsAgreementItemDto[];

    @ApiProperty({ description: '마케팅 수신 동의 여부', example: false, required: false })
    @IsBoolean()
    @IsOptional()
    marketingAgreed?: boolean;
}
