import { ApiProperty } from '@nestjs/swagger';

/** AI Agent 가동 상태 (관리자 전용) */
export class AiImageAgentHealthResponseDto {
    @ApiProperty({
        description:
            'SERVING: 정상 / DEGRADED: 프로세스는 살아 있으나 Kafka·OpenAI 키 결손 / UNREACHABLE: 에이전트에 닿지 못함',
        enum: ['SERVING', 'DEGRADED', 'UNREACHABLE'],
        example: 'SERVING',
    })
    status: 'SERVING' | 'DEGRADED' | 'UNREACHABLE';

    @ApiProperty({ description: 'gRPC 응답 수신 여부', example: true })
    isReachable: boolean;

    @ApiProperty({ description: 'AI Agent 버전', example: '1.0.0', nullable: true })
    version: string | null;

    @ApiProperty({ description: '현재 처리 중인 생성 건수', example: 0 })
    inFlightJobs: number;

    @ApiProperty({ description: 'Kafka 연결 여부 (false 면 사용자 생성 요청이 즉시 실패한다)', example: true })
    kafkaConnected: boolean;

    @ApiProperty({ description: 'OPENAI_API_KEY 설정 여부 (키 값은 노출하지 않는다)', example: true })
    openaiConfigured: boolean;

    @ApiProperty({ description: '연결 실패 사유 (정상이면 null)', nullable: true })
    errorMessage: string | null;
}
