import { ApiProperty } from '@nestjs/swagger';

import { AiImageJobStatus } from '../../../../../common/enum/ai-image-job-status.enum';

/** 어드민 생성 작업 1건 (프롬프트 스냅샷 포함 — 관리자 전용) */
export class AiImageAdminJobResponseDto {
    @ApiProperty({ description: '작업 ID', example: '507f1f77bcf86cd799439011' })
    jobId: string;

    @ApiProperty({ description: '요청한 사용자 ID', example: '507f1f77bcf86cd799439011' })
    userId: string;

    @ApiProperty({ description: '요청 시점 사용자 역할', enum: ['adopter', 'breeder'], example: 'adopter' })
    userRole: 'adopter' | 'breeder';

    @ApiProperty({ description: '대상 콘테스트 ID (무관 생성이면 null)', nullable: true })
    contestId: string | null;

    @ApiProperty({ description: '사용한 AI 필터 ID', example: '507f1f77bcf86cd799439011' })
    filterId: string;

    @ApiProperty({ description: '작업 상태', enum: AiImageJobStatus, example: AiImageJobStatus.SUCCEEDED })
    status: AiImageJobStatus;

    @ApiProperty({ description: '원본 S3 파일키', example: 'ai-image/source/abc.jpg' })
    inputObjectKey: string;

    @ApiProperty({ description: '원본 이미지 URL', nullable: true })
    inputImageUrl: string | null;

    @ApiProperty({ description: '결과 S3 파일키 (성공 시에만)', nullable: true })
    outputObjectKey: string | null;

    @ApiProperty({ description: '결과 이미지 URL (성공 시에만)', nullable: true })
    outputImageUrl: string | null;

    @ApiProperty({ description: '생성 시점 프롬프트 스냅샷' })
    promptSnapshot: string;

    @ApiProperty({ description: '생성 시점 제외 프롬프트 스냅샷' })
    negativePromptSnapshot: string;

    @ApiProperty({ description: '생성 시점 모델 스냅샷', example: 'gpt-image-1' })
    modelSnapshot: string;

    @ApiProperty({ description: '생성 시점 출력 크기 스냅샷', example: '1024x1024' })
    outputSizeSnapshot: string;

    @ApiProperty({ description: '시도 횟수', example: 1 })
    attempt: number;

    @ApiProperty({ description: '실패 사유 코드', example: 'QUEUE_UNAVAILABLE', nullable: true })
    errorCode: string | null;

    @ApiProperty({ description: '요청 일시 (ISO 8601)' })
    createdAt: string;

    @ApiProperty({ description: '종료 일시 (ISO 8601, 진행 중이면 null)', nullable: true })
    completedAt: string | null;
}
