import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { CustomLoggerService } from '../../../common/logger/custom-logger.service';
import { KafkaTopic } from '../../../common/kafka/kafka.service';
import { ApplyAiImageGenerationResultUseCase } from './application/use-cases/apply-ai-image-generation-result.use-case';
import type { AiImageGenerationResultEvent } from './application/types/ai-image-generation-command.type';

/**
 * AI 이미지 생성 결과 Consumer.
 *
 * [흐름]
 * Python AI Agent 가 생성 완료/실패 → ai-image.result.v1 발행
 *   → 이 Consumer → 작업 상태를 succeeded/failed 로 확정
 *   → 사용자는 폴링으로 결과를 받아 콘테스트에 출품
 *
 * [중요] 핸들러는 절대 throw 하지 않는다.
 * throw 하면 오프셋 커밋이 막혀 같은 메시지를 무한 재처리하게 된다.
 * 처리 실패는 로그만 남기고 넘어가며, 유실된 작업은 관리자 조회로 확인한다.
 */
@Controller()
export class AiImageGenerationKafkaConsumer {
    constructor(
        private readonly applyAiImageGenerationResultUseCase: ApplyAiImageGenerationResultUseCase,
        private readonly logger: CustomLoggerService,
    ) {}

    @EventPattern(KafkaTopic.AI_IMAGE_RESULT)
    async handleGenerationResult(@Payload() payload: unknown): Promise<void> {
        try {
            const event = this.parsePayload(payload);
            if (!event) return;

            await this.applyAiImageGenerationResultUseCase.execute(event);
        } catch (error) {
            this.logger.logError('handleAiImageGenerationResult', 'AI 생성 결과 처리 실패', error);
        }
    }

    /** 형식이 어긋난 메시지는 재처리해도 성공할 수 없으므로 버린다 */
    private parsePayload(payload: unknown): AiImageGenerationResultEvent | null {
        const parsed = (typeof payload === 'string' ? JSON.parse(payload) : payload) as
            | Partial<AiImageGenerationResultEvent>
            | null;

        if (!parsed?.jobId || (parsed.status !== 'succeeded' && parsed.status !== 'failed')) {
            this.logger.logWarning(
                'handleAiImageGenerationResult',
                'AI 생성 결과 메시지 형식 오류 - 폐기',
                null,
            );
            return null;
        }

        if (parsed.status === 'succeeded' && !parsed.outputObjectKey) {
            this.logger.logWarning(
                'handleAiImageGenerationResult',
                `성공 결과에 outputObjectKey 누락 - 폐기: ${parsed.jobId}`,
                null,
            );
            return null;
        }

        return parsed as AiImageGenerationResultEvent;
    }
}
