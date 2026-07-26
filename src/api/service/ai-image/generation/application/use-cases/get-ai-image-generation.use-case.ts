import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';

import {
    AI_IMAGE_JOB_READER_PORT,
    type AiImageJobReaderPort,
} from '../../../shared/application/ports/ai-image-job-reader.port';
import { AiImageGenerationResultMapperService } from '../../domain/services/ai-image-generation-result-mapper.service';
import type { AiImageGenerationResult } from '../types/ai-image-generation-result.type';

/** GET v2/ai-image/generation/:jobId — 상태 폴링 */
@Injectable()
export class GetAiImageGenerationUseCase {
    constructor(
        @Inject(AI_IMAGE_JOB_READER_PORT)
        private readonly jobReader: AiImageJobReaderPort,
        private readonly mapper: AiImageGenerationResultMapperService,
    ) {}

    async execute(jobId: string, userId: string): Promise<AiImageGenerationResult> {
        const job = await this.jobReader.findById(jobId);
        if (!job) {
            throw new BadRequestException('AI 생성 요청을 찾을 수 없습니다.');
        }
        if (job.userId !== userId) {
            throw new ForbiddenException('본인의 생성 요청만 조회할 수 있습니다.');
        }
        return this.mapper.toResult(job);
    }
}
