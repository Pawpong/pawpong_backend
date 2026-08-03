import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../../common/logger/custom-logger.service';
import {
    AI_IMAGE_FILTER_READER_PORT,
    type AiImageFilterReaderPort,
} from '../../../shared/application/ports/ai-image-filter-reader.port';
import {
    AI_IMAGE_JOB_READER_PORT,
    type AiImageJobReaderPort,
} from '../../../shared/application/ports/ai-image-job-reader.port';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../../constants/ai-image-response-messages';
import { AiImageObjectKeyService } from '../../../shared/domain/services/ai-image-object-key.service';
import { AiImageQuotaService } from '../../domain/services/ai-image-quota.service';
import {
    AI_IMAGE_GENERATION_PUBLISHER_PORT,
    type AiImageGenerationPublisherPort,
} from '../ports/ai-image-generation-publisher.port';
import { AI_IMAGE_JOB_WRITER_PORT, type AiImageJobWriterPort } from '../ports/ai-image-job-writer.port';
import type { AiImageJobSnapshot } from '../../../shared/application/types/ai-image-job-snapshot.type';

export interface RequestAiImageGenerationCommand {
    userId: string;
    userRole: 'adopter' | 'breeder';
    filterId: string;
    inputObjectKey: string;
    contestId?: string;
}

/**
 * POST v2/ai-image/generation
 *
 * 흐름: 필터 확인 → 쿼터 확인 → PENDING 작업 생성 → 큐 발행 → QUEUED 전이.
 * 큐 발행이 실패하면 작업을 즉시 FAILED 로 마킹한다. 그대로 두면 사용자에게
 * "대기 중"으로 보이는 유령 작업이 남기 때문이다.
 */
@Injectable()
export class RequestAiImageGenerationUseCase {
    constructor(
        @Inject(AI_IMAGE_FILTER_READER_PORT)
        private readonly filterReader: AiImageFilterReaderPort,
        @Inject(AI_IMAGE_JOB_READER_PORT)
        private readonly jobReader: AiImageJobReaderPort,
        @Inject(AI_IMAGE_JOB_WRITER_PORT)
        private readonly jobWriter: AiImageJobWriterPort,
        @Inject(AI_IMAGE_GENERATION_PUBLISHER_PORT)
        private readonly publisher: AiImageGenerationPublisherPort,
        private readonly objectKey: AiImageObjectKeyService,
        private readonly quota: AiImageQuotaService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(command: RequestAiImageGenerationCommand): Promise<AiImageJobSnapshot> {
        const filter = await this.filterReader.findById(command.filterId);
        if (!filter) {
            throw new BadRequestException(AI_IMAGE_RESPONSE_MESSAGES.filterNotFound);
        }
        if (!filter.isActive) {
            throw new BadRequestException('현재 사용할 수 없는 필터입니다.');
        }

        const contestId = command.contestId ?? null;
        const usedCount = await this.jobReader.countByUserAndContest(command.userId, contestId);
        this.quota.ensureWithinQuota(usedCount);

        // 생성 시점 필터 값을 스냅샷으로 복사 — 이후 관리자가 필터를 바꿔도 결과가 흔들리지 않는다
        const job = await this.jobWriter.createPending({
            userId: command.userId,
            userRole: command.userRole,
            contestId,
            filterId: filter.filterId,
            inputObjectKey: command.inputObjectKey,
            promptSnapshot: filter.prompt,
            negativePromptSnapshot: filter.negativePrompt,
            modelSnapshot: filter.model,
            outputSizeSnapshot: filter.outputSize,
        });

        const outputObjectKey = this.objectKey.resolveResultKey(job.jobId);

        try {
            await this.publisher.publishGenerationRequested({
                id: job.jobId, // KafkaService.emit 파티션 키 — 작업 단위 순서 보장
                jobId: job.jobId,
                userId: job.userId,
                inputObjectKey: job.inputObjectKey,
                outputObjectKey,
                prompt: job.promptSnapshot,
                negativePrompt: job.negativePromptSnapshot,
                model: job.modelSnapshot,
                outputSize: job.outputSizeSnapshot,
                requestedAt: new Date().toISOString(),
            });
        } catch (error) {
            // 큐에 못 실었으면 대기 상태로 남기지 않고 즉시 실패로 확정한다
            await this.jobWriter.markFailed(job.jobId, 'QUEUE_UNAVAILABLE');
            this.logger.logError('requestAiImageGeneration', 'AI 생성 요청 큐 발행 실패', error);
            throw error;
        }

        const queued = await this.jobWriter.markQueued(job.jobId);
        return queued ?? job;
    }
}
