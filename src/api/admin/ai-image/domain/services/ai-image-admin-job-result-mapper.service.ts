import { Inject, Injectable } from '@nestjs/common';

import {
    AI_IMAGE_ASSET_URL_PORT,
    type AiImageAssetUrlPort,
} from '../../../../service/ai-image/shared/application/ports/ai-image-asset-url.port';
import type { AiImageJobDocument } from '../../../../../schema/ai-image-job.schema';
import type { AiImageAdminJobResult } from '../../application/types/ai-image-admin-job.type';

/** 어드민 생성 작업 응답 조립 (프롬프트 스냅샷 포함 — 관리자 전용) */
@Injectable()
export class AiImageAdminJobResultMapperService {
    constructor(
        @Inject(AI_IMAGE_ASSET_URL_PORT)
        private readonly assetUrl: AiImageAssetUrlPort,
    ) {}

    toResult(job: AiImageJobDocument): AiImageAdminJobResult {
        return {
            jobId: job._id.toString(),
            userId: job.userId,
            userRole: job.userRole,
            contestId: job.contestId ? job.contestId.toString() : null,
            filterId: job.filterId.toString(),
            status: job.status,
            inputObjectKey: job.inputObjectKey,
            // 실패 원인이 원본에 있는 경우가 있어 어드민은 입력 이미지도 볼 수 있어야 한다
            inputImageUrl: this.assetUrl.toUrl(job.inputObjectKey) ?? null,
            outputObjectKey: job.outputObjectKey,
            outputImageUrl: this.assetUrl.toUrl(job.outputObjectKey) ?? null,
            promptSnapshot: job.promptSnapshot,
            negativePromptSnapshot: job.negativePromptSnapshot,
            modelSnapshot: job.modelSnapshot,
            outputSizeSnapshot: job.outputSizeSnapshot,
            attempt: job.attempt,
            errorCode: job.errorCode,
            createdAt: job.createdAt.toISOString(),
            completedAt: job.completedAt ? job.completedAt.toISOString() : null,
        };
    }
}
