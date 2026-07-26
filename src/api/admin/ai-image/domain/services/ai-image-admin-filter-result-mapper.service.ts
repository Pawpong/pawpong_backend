import { Inject, Injectable } from '@nestjs/common';

import { AI_IMAGE_ASSET_URL_PORT, type AiImageAssetUrlPort } from '../../../../service/ai-image/shared/application/ports/ai-image-asset-url.port';
import type { AiImageFilterSnapshot } from '../../../../service/ai-image/shared/application/types/ai-image-filter-snapshot.type';
import type { AiImageAdminFilterResult } from '../../application/types/ai-image-admin-filter-result.type';

/** 어드민 필터 응답 조립 (프롬프트 포함 — 관리자 전용) */
@Injectable()
export class AiImageAdminFilterResultMapperService {
    constructor(
        @Inject(AI_IMAGE_ASSET_URL_PORT)
        private readonly assetUrl: AiImageAssetUrlPort,
    ) {}

    toResult(snapshot: AiImageFilterSnapshot): AiImageAdminFilterResult {
        return {
            filterId: snapshot.filterId,
            name: snapshot.name,
            description: snapshot.description,
            thumbnailUrl: this.assetUrl.toUrl(snapshot.thumbnailFileName),
            thumbnailFileName: snapshot.thumbnailFileName,
            prompt: snapshot.prompt,
            negativePrompt: snapshot.negativePrompt,
            model: snapshot.model,
            outputSize: snapshot.outputSize,
            referenceImageObjectKeys: snapshot.referenceImageObjectKeys,
            isActive: snapshot.isActive,
            sortOrder: snapshot.sortOrder,
            createdAt: snapshot.createdAt.toISOString(),
            updatedAt: snapshot.updatedAt.toISOString(),
        };
    }
}
