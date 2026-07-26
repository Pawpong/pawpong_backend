import { ApiProperty } from '@nestjs/swagger';

/** 미리보기 결과 */
export class AiImageFilterPreviewResponseDto {
    @ApiProperty({ description: '생성 성공 여부', example: true })
    isSuccess: boolean;

    @ApiProperty({ description: '결과 파일키 (실패 시 null)', example: 'ai-image/preview/ab12.png', nullable: true })
    outputObjectKey: string | null;

    @ApiProperty({ description: '결과 이미지 URL (실패 시 null)', nullable: true })
    outputImageUrl: string | null;

    @ApiProperty({ description: 'AI Agent 처리 시간(ms)', example: 8421 })
    latencyMs: number;

    @ApiProperty({ description: '실패 사유 코드', example: 'OPENAI_CALL_FAILED', nullable: true })
    errorCode: string | null;

    @ApiProperty({ description: '실패 상세 메시지', nullable: true })
    errorMessage: string | null;
}
