import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { AI_IMAGE_JOB_WRITER_PORT, type AiImageJobWriterPort } from '../ports/ai-image-job-writer.port';
import type { AiImageGenerationResultEvent } from '../types/ai-image-generation-command.type';

/**
 * AI Agent 가 발행한 생성 결과를 작업에 반영한다.
 *
 * 결과 메시지는 at-least-once 로 중복 도착할 수 있다.
 * writer 의 전이는 "진행 중일 때만" 적용되는 조건부 업데이트라,
 * 이미 종결된 작업이면 null 이 돌아오고 여기서는 로그만 남기고 정상 종료한다.
 */
@Injectable()
export class ApplyAiImageGenerationResultUseCase {
    constructor(
        @Inject(AI_IMAGE_JOB_WRITER_PORT)
        private readonly jobWriter: AiImageJobWriterPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(event: AiImageGenerationResultEvent): Promise<void> {
        const applied =
            event.status === 'succeeded'
                ? await this.jobWriter.markSucceeded(event.jobId, event.outputObjectKey ?? '')
                : await this.jobWriter.markFailed(event.jobId, event.errorCode ?? 'AI_GENERATION_FAILED');

        if (!applied) {
            this.logger.logWarning(
                'applyAiImageGenerationResult',
                `이미 종결되었거나 존재하지 않는 작업의 결과 수신 - 무시: ${event.jobId}`,
                null,
            );
            return;
        }

        this.logger.logSuccess(
            'applyAiImageGenerationResult',
            `AI 생성 결과 반영 완료: ${event.jobId} (${event.status})`,
        );
    }
}
