import { Inject, Injectable } from '@nestjs/common';

import {
    AI_IMAGE_ASSET_URL_PORT,
    type AiImageAssetUrlPort,
} from '../../../shared/application/ports/ai-image-asset-url.port';
import type { AiImageJobSnapshot } from '../../../shared/application/types/ai-image-job-snapshot.type';
import type { AiImageGenerationResult } from '../../application/types/ai-image-generation-result.type';

/** 생성 작업 응답 조립. 프롬프트 스냅샷은 노출하지 않는다. */
@Injectable()
export class AiImageGenerationResultMapperService {
    constructor(
        @Inject(AI_IMAGE_ASSET_URL_PORT)
        private readonly assetUrl: AiImageAssetUrlPort,
    ) {}

    toResult(job: AiImageJobSnapshot): AiImageGenerationResult {
        return {
            jobId: job.jobId,
            status: job.status,
            filterId: job.filterId,
            resultImageUrl: this.assetUrl.toUrl(job.outputObjectKey),
            resultObjectKey: job.outputObjectKey,
            errorCode: job.errorCode,
            createdAt: job.createdAt.toISOString(),
            completedAt: job.completedAt ? job.completedAt.toISOString() : null,
        };
    }
}
