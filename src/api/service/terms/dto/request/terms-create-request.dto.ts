import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import type { TermsCode } from '../../../../../schema/terms.schema';
import { TERMS_CODE_VALUES } from '../../constants/terms-swagger.constants';

/**
 * 약관 생성 요청 DTO
 */
export class TermsCreateRequestDto {
    @ApiProperty({
        description: '약관 코드',
        example: 'service',
        enum: TERMS_CODE_VALUES,
    })
    @IsEnum(TERMS_CODE_VALUES)
    code: TermsCode;

    @ApiProperty({
        description: '약관 버전 (같은 code 안에서 유일해야 함)',
        example: '2026-09-14',
    })
    @IsString()
    @IsNotEmpty()
    version: string;

    @ApiProperty({
        description: '약관 제목',
        example: '서비스 이용약관',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: '약관 본문 (markdown 또는 html)',
        example: '## 서비스 이용약관\n\n제1조 ...',
    })
    @IsString()
    @IsNotEmpty()
    body: string;

    @ApiProperty({
        description: '필수 동의 여부',
        example: true,
        default: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isRequired?: boolean;

    @ApiProperty({
        description: '생성과 동시에 활성화할지 여부 (true 면 같은 code 의 기존 활성 버전은 비활성화됨)',
        example: false,
        default: false,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    activate?: boolean;
}
