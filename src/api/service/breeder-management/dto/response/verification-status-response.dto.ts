import { ApiProperty } from '@nestjs/swagger';

import { BreederPlan, VerificationStatus } from '../../../../../common/enum/user.enum';

export class VerificationDocumentResponseDto {
    @ApiProperty({ example: 'adoption_contract_sample' })
    type: string;

    @ApiProperty({ example: 'verification/breeder123/adoptionContract_uuid.pdf' })
    fileName: string;

    @ApiProperty({ example: 'https://kr.object.iwinv.kr/pawpong_s3/verification/...' })
    url: string;

    @ApiProperty({ required: false, example: '2026-08-31T00:00:00.000Z' })
    uploadedAt?: Date;

    @ApiProperty({ required: false, example: '입양계약서.pdf' })
    originalFileName?: string;
}

/**
 * 브리더 인증 상태 응답 DTO
 */
export class VerificationStatusResponseDto {
    @ApiProperty({
        description: '인증 상태',
        example: 'approved',
        enum: VerificationStatus,
    })
    status: VerificationStatus;

    @ApiProperty({
        description: '구독 플랜',
        example: BreederPlan.BASIC,
        enum: BreederPlan,
        required: false,
    })
    plan?: BreederPlan;

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
        type: () => [VerificationDocumentResponseDto],
        required: false,
    })
    documents?: VerificationDocumentResponseDto[];

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
}
