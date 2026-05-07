import { ApiProperty } from '@nestjs/swagger';

import type { TermsCode } from '../../../../schema/terms.schema';

/**
 * 약관 응답 DTO
 */
export class TermsResponseDto {
    @ApiProperty({
        description: '약관 ID',
        example: '507f1f77bcf86cd799439011',
    })
    termsId: string;

    @ApiProperty({
        description: '약관 코드',
        example: 'service',
        enum: ['service', 'privacy', 'marketing', 'age_14plus', 'counsel_privacy'],
    })
    code: TermsCode;

    @ApiProperty({
        description: '약관 버전',
        example: 'v1.0',
    })
    version: string;

    @ApiProperty({
        description: '약관 제목',
        example: '서비스 이용약관',
    })
    title: string;

    @ApiProperty({
        description: '약관 본문 (markdown 또는 html)',
        example: '## 서비스 이용약관\n\n제1조 ...',
    })
    body: string;

    @ApiProperty({
        description: '필수 동의 여부',
        example: true,
    })
    isRequired: boolean;

    @ApiProperty({
        description: '활성화 시점',
        example: '2025-01-15T00:00:00.000Z',
        required: false,
    })
    activatedAt?: string;

    @ApiProperty({
        description: '생성일',
        example: '2025-01-14T10:30:00.000Z',
    })
    createdAt: string;

    @ApiProperty({
        description: '수정일',
        example: '2025-01-14T10:30:00.000Z',
    })
    updatedAt: string;
}
