import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AiImageJobStatus } from '../../../../../../common/enum/ai-image-job-status.enum';

export class AiImageGenerationResponseDto {
    @ApiProperty({ description: '생성 작업 ID', example: '507f1f77bcf86cd799439011' })
    jobId: string;

    @ApiProperty({ description: '작업 상태', enum: AiImageJobStatus, example: AiImageJobStatus.QUEUED })
    status: AiImageJobStatus;

    @ApiProperty({ description: '사용한 필터 ID' })
    filterId: string;

    @ApiPropertyOptional({ description: '생성 결과 이미지 URL (성공 시)' })
    resultImageUrl?: string;

    @ApiProperty({
        description: '콘테스트 출품에 넘길 결과 파일키 (성공 시)',
        nullable: true,
        example: 'ai-image/result/507f1f77bcf86cd799439011.png',
    })
    resultObjectKey: string | null;

    @ApiProperty({ description: '실패 사유 코드', nullable: true, example: null })
    errorCode: string | null;

    @ApiProperty({ description: '요청 일시 (ISO 8601)' })
    createdAt: string;

    @ApiProperty({ description: '종료 일시 (ISO 8601)', nullable: true })
    completedAt: string | null;
}
