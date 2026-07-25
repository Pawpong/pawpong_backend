import { Inject, Injectable } from '@nestjs/common';

import {
    AI_IMAGE_JOB_READER_PORT,
    type AiImageJobReaderPort,
} from '../../../shared/application/ports/ai-image-job-reader.port';
import { AiImageGenerationResultMapperService } from '../../domain/services/ai-image-generation-result-mapper.service';
import type { AiImageGenerationResult } from '../types/ai-image-generation-result.type';

const MY_GENERATIONS_LIMIT = 30;

/** GET v2/ai-image/generations — 내 생성 이력 (최신순) */
@Injectable()
export class GetMyAiImageGenerationsUseCase {
    constructor(
        @Inject(AI_IMAGE_JOB_READER_PORT)
        private readonly jobReader: AiImageJobReaderPort,
        private readonly mapper: AiImageGenerationResultMapperService,
    ) {}

    async execute(userId: string): Promise<AiImageGenerationResult[]> {
        const jobs = await this.jobReader.findByUserId(userId, MY_GENERATIONS_LIMIT);
        return jobs.map((job) => this.mapper.toResult(job));
    }
}
