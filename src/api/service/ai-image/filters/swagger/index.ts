import { applyDecorators } from '@nestjs/common';

import { ApiEndpoint, ApiPublicController } from '../../../../../common/decorator/swagger.decorator';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../constants/ai-image-response-messages';
import { AiImageFilterResponseDto } from '../dto/response/ai-image-filter-response.dto';

export function ApiAiImagePublicController() {
    return ApiPublicController('AI 이미지 (v2)');
}

export function ApiGetActiveAiImageFiltersEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'AI 필터 목록 (사용자)',
            description: `
                사용자가 선택할 수 있는 활성 필터 목록. 정렬 순서 오름차순.
                프롬프트·모델 등 운영 정보는 응답에 포함되지 않는다.
            `,
            responseType: [AiImageFilterResponseDto],
            isPublic: true,
            successDescription: 'AI 필터 목록 조회 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.filtersRetrieved,
        }),
    );
}
