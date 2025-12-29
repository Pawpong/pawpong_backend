import { IsString, IsBoolean, IsArray, IsOptional, IsEnum, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import type { AlimtalkButtonType } from '../../../../../schema/alimtalk-template.schema';
import { AlimtalkButtonDto } from './template-update-request.dto';

/**
 * 알림톡 템플릿 생성 요청 DTO
 */
export class TemplateCreateRequestDto {
    @ApiProperty({
        description: '템플릿 코드 (대문자 스네이크 케이스)',
        example: 'PAYMENT_CONFIRMATION',
    })
    @IsString()
    @IsNotEmpty()
    templateCode: string;

    @ApiProperty({
        description: '솔라피 템플릿 ID',
        example: 'KA01TP251221145150608gmUJUCLiOfs',
    })
    @IsString()
    @IsNotEmpty()
    templateId: string;

    @ApiProperty({
        description: '템플릿 이름',
        example: '결제 완료 알림',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: '템플릿 설명',
        example: '결제 완료 시 사용자에게 발송하는 알림',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: '필수 변수 목록',
        example: ['결제금액', '주문번호'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    requiredVariables: string[];

    @ApiProperty({
        description: '알림톡 실패 시 SMS 대체 발송 여부',
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    fallbackToSms?: boolean;

    @ApiProperty({
        description: '템플릿 활성화 여부',
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        description: '카카오 검수 상태',
        example: 'approved',
        enum: ['pending', 'approved', 'rejected', 're_review'],
        default: 'approved',
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
