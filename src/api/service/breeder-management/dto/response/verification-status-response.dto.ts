import { ApiProperty } from '@nestjs/swagger';

/**
 * 브리더 인증 상태 응답 DTO
 */
export class VerificationStatusResponseDto {
    @ApiProperty({
        description: '인증 상태',
        example: 'approved',
        enum: ['pending', 'reviewing', 'approved', 'rejected'],
    })
    status: string;

    @ApiProperty({
        description: '구독 플랜',
        example: 'premium',
        enum: ['basic', 'premium', 'enterprise'],
        required: false,
    })
    plan?: string;

    @ApiProperty({
        description: '브리더 레벨',
        example: 'advanced',
        enum: ['new', 'intermediate', 'advanced', 'expert'],
        required: false,
    })
    level?: string;

    @ApiProperty({
        description: '제출 일시',
        example: '2024-01-15T10:30:00.000Z',
        required: false,
    })
    submittedAt?: Date;

    @ApiProperty({
        description: '검토 일시',
        example: '2024-01-16T14:20:00.000Z',
        required: false,
    })
    reviewedAt?: Date;

    @ApiProperty({
        description: '인증 문서 정보',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                type: { type: 'string', example: 'business_license' },
                fileName: { type: 'string', example: 'verification/breeder123/idCard_uuid.pdf' },
                url: { type: 'string', example: 'https://storage.googleapis.com/...' },
                uploadedAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
                originalFileName: { type: 'string', example: '신분증.pdf' },
            },
        },
        required: false,
    })
    documents?: Array<{
        type: string;
        fileName: string;
        url: string;
        uploadedAt?: Date;
        originalFileName?: string;
    }>;

    @ApiProperty({
        description: '거절 사유',
        example: '제출된 서류가 불명확합니다.',
        required: false,
    })
    rejectionReason?: string;

    @ApiProperty({
        example: false,
        required: false,
    })
    submittedByEmail?: boolean;

    @ApiProperty({
        description: '등급 변경 심사 진행 여부',
        example: false,
    })
    isLevelChangeRequested: boolean;

    @ApiProperty({
        description: '진행 중인 등급 변경 신청 요약',
        required: false,
        example: {
            previousLevel: 'new',
            requestedLevel: 'elite',
            requestedAt: '2026-08-31T00:00:00.000Z',
            documents: [],
        },
    })
    levelChangeRequest?: {
        previousLevel: string;
        requestedLevel: string;
        requestedAt: Date;
        documents: Array<{
            type: string;
            fileName: string;
            url: string;
            uploadedAt?: Date;
            originalFileName?: string;
        }>;
    };

    @ApiProperty({
        description: '최근 등급 변경 심사 반려 사유',
        required: false,
    })
    levelChangeRejectionReason?: string;

    @ApiProperty({
        description: '최근 등급 변경 심사 완료 일시',
        required: false,
    })
    levelChangeReviewedAt?: Date;
}
