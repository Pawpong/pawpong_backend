import { Inject, Injectable } from '@nestjs/common';

import { AI_IMAGE_PREVIEW_PORT } from '../ports/ai-image-preview.port';
import type { AiImagePreviewPort } from '../ports/ai-image-preview.port';
import type { AiImagePreviewCommand, AiImagePreviewResult } from '../types/ai-image-preview.type';

/**
 * 어드민 필터 미리보기.
 *
 * 필터를 저장하지 않고 프롬프트만 시험한다. Job 을 만들지 않으므로
 * 사용자 쿼터에도 영향이 없고, 생성 이력에도 남지 않는다.
 */
@Injectable()
export class GenerateAiImageFilterPreviewUseCase {
    constructor(@Inject(AI_IMAGE_PREVIEW_PORT) private readonly previewPort: AiImagePreviewPort) {}

    async execute(command: AiImagePreviewCommand): Promise<AiImagePreviewResult> {
        return this.previewPort.generatePreview(command);
    }
}
