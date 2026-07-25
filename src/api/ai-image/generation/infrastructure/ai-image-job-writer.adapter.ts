import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { AiImageJobStatus } from '../../../../common/enum/ai-image-job-status.enum';
import { AiImageJobRepository } from '../../shared/repository/ai-image-job.repository';
import { toAiImageJobSnapshot } from '../../shared/infrastructure/ai-image-job-snapshot.mapper';
import type { AiImageJobSnapshot } from '../../shared/application/types/ai-image-job-snapshot.type';
import type { AiImageJobWriterPort } from '../application/ports/ai-image-job-writer.port';
import type { AiImageJobCreateCommand } from '../application/types/ai-image-generation-command.type';

@Injectable()
export class AiImageJobWriterAdapter implements AiImageJobWriterPort {
    constructor(private readonly repository: AiImageJobRepository) {}

    async createPending(data: AiImageJobCreateCommand): Promise<AiImageJobSnapshot> {
        const job = await this.repository.create({
            ...data,
            contestId: data.contestId ? new Types.ObjectId(data.contestId) : null,
            filterId: new Types.ObjectId(data.filterId),
            status: AiImageJobStatus.PENDING,
        });
        return toAiImageJobSnapshot(job);
    }

    async markQueued(jobId: string): Promise<AiImageJobSnapshot | null> {
        const job = await this.repository.transitionIfInProgress(jobId, { status: AiImageJobStatus.QUEUED });
        return job ? toAiImageJobSnapshot(job) : null;
    }

    async markSucceeded(jobId: string, outputObjectKey: string): Promise<AiImageJobSnapshot | null> {
        const job = await this.repository.transitionIfInProgress(jobId, {
            status: AiImageJobStatus.SUCCEEDED,
            outputObjectKey,
            errorCode: null,
            completedAt: new Date(),
        });
        return job ? toAiImageJobSnapshot(job) : null;
    }

    async markFailed(jobId: string, errorCode: string): Promise<AiImageJobSnapshot | null> {
        const job = await this.repository.transitionIfInProgress(jobId, {
            status: AiImageJobStatus.FAILED,
            errorCode,
            completedAt: new Date(),
        });
        return job ? toAiImageJobSnapshot(job) : null;
    }
}
