import { Injectable } from '@nestjs/common';

import type { AiImageJobDocument } from '../../../../schema/ai-image-job.schema';
import type { AiImageJobReaderPort } from '../application/ports/ai-image-job-reader.port';
import type { AiImageJobSnapshot } from '../application/types/ai-image-job-snapshot.type';
import { AiImageJobRepository } from '../repository/ai-image-job.repository';
import { toAiImageJobSnapshot } from './ai-image-job-snapshot.mapper';

@Injectable()
export class AiImageJobReaderAdapter implements AiImageJobReaderPort {
    constructor(private readonly repository: AiImageJobRepository) {}

    async findById(jobId: string): Promise<AiImageJobSnapshot | null> {
        const job = await this.repository.findById(jobId);
        return job ? toAiImageJobSnapshot(job) : null;
    }

    async findByUserId(userId: string, limit: number): Promise<AiImageJobSnapshot[]> {
        const jobs: AiImageJobDocument[] = await this.repository.findByUserId(userId, limit);
        return jobs.map((job) => toAiImageJobSnapshot(job));
    }

    countByUserAndContest(userId: string, contestId: string | null): Promise<number> {
        return this.repository.countByUserAndContest(userId, contestId);
    }
}
