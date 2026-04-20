import { ApiProperty } from '@nestjs/swagger';

export class BreederManagementApplicationDetailResponseDto {
    @ApiProperty({
        description: '입양 신청 고유 ID',
        example: '507f1f77bcf86cd799439088',
    })
    applicationId: string;

    @ApiProperty({
        description: '입양자 고유 ID',
        example: '507f1f77bcf86cd799439044',
    })
    adopterId: string;

    @ApiProperty({
        description: '입양자 이름',
        example: '김입양',
    })
    adopterName: string;

    @ApiProperty({
        description: '입양자 이메일',
        example: 'adopter@example.com',
    })
    adopterEmail: string;

    @ApiProperty({
        description: '입양자 휴대폰 번호',
        example: '01012345678',
    })
    adopterPhone: string;

    @ApiProperty({
        description: '신청한 반려동물 ID',
        example: '507f1f77bcf86cd799439099',
        required: false,
    })
    petId?: string;

    @ApiProperty({
        description: '신청한 반려동물 이름',
        example: '루이',
        required: false,
    })
    petName?: string;

    @ApiProperty({
        description: '신청 처리 상태',
        example: 'consultation_pending',
    })
    status: string;

    @ApiProperty({
        description: '표준 질문 응답',
        type: 'object',
        additionalProperties: true,
        example: {
            selfIntroduction: '반려 경험이 있습니다.',
            preferredPetDescription: '소형견을 선호합니다.',
        },
    })
    standardResponses: Record<string, unknown>;

    @ApiProperty({
        description: '커스텀 질문 응답',
        type: 'array',
        items: {
            type: 'object',
            additionalProperties: true,
        },
        example: [{ question: '추가 질문', answer: '답변 내용' }],
    })
    customResponses: unknown[];

    @ApiProperty({
        description: '신청 접수 일시',
        example: '2024-01-15T10:30:00.000Z',
        format: 'date-time',
    })
    appliedAt: string;

    @ApiProperty({
        description: '신청 처리 일시',
        example: '2024-01-16T15:45:00.000Z',
        format: 'date-time',
        required: false,
    })
    processedAt?: string;

    @ApiProperty({
        description: '브리더 메모',
        example: '면담 후 최종 결정 예정',
        required: false,
    })
    breederNotes?: string;
}
