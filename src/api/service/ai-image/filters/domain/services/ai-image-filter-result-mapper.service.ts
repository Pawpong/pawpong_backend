import { Inject, Injectable } from '@nestjs/common';

import {
    AI_IMAGE_ASSET_URL_PORT,
    type AiImageAssetUrlPort,
} from '../../../shared/application/ports/ai-image-asset-url.port';
import type { AiImageFilterSnapshot } from '../../../shared/application/types/ai-image-filter-snapshot.type';
import type { AiImageFilterResult } from '../../application/types/ai-image-filter-result.type';

/**
 * 사용자 필터 카드 조립.
 * 프롬프트·모델·레퍼런스 키를 의도적으로 제외한다 (운영 정보 노출 방지).
 */
@Injectable()
export class AiImageFilterResultMapperService {
    constructor(
        @Inject(AI_IMAGE_ASSET_URL_PORT)
        private readonly assetUrl: AiImageAssetUrlPort,
    ) {}

    toResult(snapshot: AiImageFilterSnapshot): AiImageFilterResult {
        return {
            filterId: snapshot.filterId,
            name: snapshot.name,
            description: snapshot.description,
            thumbnailUrl: this.assetUrl.toUrl(snapshot.thumbnailFileName),
        };
    }
}
