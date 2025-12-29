import { IsString, IsBoolean, IsArray, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import type { AlimtalkButtonType } from '../../../../../schema/alimtalk-template.schema';

/**
 * 알림톡 버튼 DTO
 */
export class AlimtalkButtonDto {
    @ApiProperty({
        description: '버튼 타입',
        enum: ['WL', 'AL', 'BK', 'MD', 'DS', 'BC', 'BT', 'AC'],
        example: 'WL',
    })
    @IsEnum(['WL', 'AL', 'BK', 'MD', 'DS', 'BC', 'BT', 'AC'])
    buttonType: AlimtalkButtonType;

    @ApiProperty({
        description: '버튼명',
        example: '포퐁 바로가기',
    })
    @IsString()
    buttonName: string;

    @ApiProperty({
        description: '모바일 웹링크 URL',
        example: 'https://pawpong.kr',
        required: false,
    })
    @IsOptional()
    @IsString()
    linkMo?: string;

    @ApiProperty({
        description: 'PC 웹링크 URL',
        example: 'https://pawpong.kr',
        required: false,
    })
    @IsOptional()
    @IsString()
    linkPc?: string;

    @ApiProperty({
        description: '앱링크 스킴 (Android)',
        required: false,
    })
    @IsOptional()
    @IsString()
    linkAnd?: string;

    @ApiProperty({
        description: '앱링크 스킴 (iOS)',
        required: false,
    })
    @IsOptional()
    @IsString()
    linkIos?: string;
}

/**
 * 알림톡 템플릿 수정 요청 DTO
 */
export class TemplateUpdateRequestDto {
    @ApiProperty({
        description: '솔라피 템플릿 ID',
        example: 'KA01TP251221145150608gmUJUCLiOfs',
        required: false,
    })
    @IsOptional()
    @IsString()
    templateId?: string;

    @ApiProperty({
        description: '템플릿 이름',
        example: '회원가입 인증번호',
        required: false,
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: '템플릿 설명',
        example: '회원가입 시 전화번호 인증을 위한 인증번호 발송',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: '필수 변수 목록',
        example: ['인증번호'],
        type: [String],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    requiredVariables?: string[];

    @ApiProperty({
        description: '알림톡 실패 시 SMS 대체 발송 여부',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    fallbackToSms?: boolean;

    @ApiProperty({
        description: '템플릿 활성화 여부',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        description: '카카오 검수 상태',
        example: 'approved',
        enum: ['pending', 'approved', 'rejected', 're_review'],
        required: false,
    })
    @IsOptional()
    @IsEnum(['pending', 'approved', 'rejected', 're_review'])
    reviewStatus?: string;

    @ApiProperty({
        description: '메모 (관리자용)',
        example: '2025-12-22 검수 통과',
        required: false,
    })
    @IsOptional()
    @IsString()
    memo?: string;

    @ApiProperty({
        description: '알림톡 버튼 목록 (최대 5개)',
        type: [AlimtalkButtonDto],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AlimtalkButtonDto)
    buttons?: AlimtalkButtonDto[];
}
