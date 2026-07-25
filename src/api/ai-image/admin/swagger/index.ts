import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../constants/ai-image-response-messages';
import { AiImageAdminFilterResponseDto, AiImageFilterDeleteResponseDto } from '../dto/response/ai-image-admin-filter-response.dto';

const FILTER_NOT_FOUND_RESPONSE = {
    status: 400,
    description: '대상 필터 없음',
    errorExample: AI_IMAGE_RESPONSE_MESSAGES.filterNotFound,
} as const;

export function ApiAiImageAdminController() {
    return ApiController('AI 이미지 관리 (Admin)');
}

export function ApiGetAllAiImageFiltersEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'AI 필터 전체 목록',
            description: '비활성 필터를 포함한 전체 목록. 프롬프트가 포함되므로 관리자 전용이다.',
            responseType: [AiImageAdminFilterResponseDto],
            successDescription: 'AI 필터 목록 조회 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.filtersRetrieved,
        }),
    );
}

export function ApiCreateAiImageFilterEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'AI 필터 생성',
            description: '사용자가 선택할 수 있는 이미지 변환 필터를 등록한다.',
            responseType: AiImageAdminFilterResponseDto,
            successDescription: 'AI 필터 생성 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.filterCreated,
        }),
    );
}

export function ApiUpdateAiImageFilterEndpoint() {
    return applyDecorators(
        ApiParam({ name: 'filterId', description: 'AI 필터 ID', example: '507f1f77bcf86cd799439011' }),
        ApiEndpoint({
            summary: 'AI 필터 수정',
            description: `
                필터를 부분 수정한다.
                이미 생성된 작업은 생성 시점의 프롬프트·모델 스냅샷을 사용하므로 결과가 바뀌지 않는다.
            `,
            responseType: AiImageAdminFilterResponseDto,
            successDescription: 'AI 필터 수정 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.filterUpdated,
            errorResponses: [FILTER_NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiDeleteAiImageFilterEndpoint() {
    return applyDecorators(
        ApiParam({ name: 'filterId', description: 'AI 필터 ID', example: '507f1f77bcf86cd799439011' }),
        ApiEndpoint({
            summary: 'AI 필터 삭제',
            description: '필터를 삭제한다. 기존 생성 작업은 스냅샷을 보유하므로 영향받지 않는다.',
            responseType: AiImageFilterDeleteResponseDto,
            successDescription: 'AI 필터 삭제 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.filterDeleted,
            errorResponses: [FILTER_NOT_FOUND_RESPONSE],
        }),
    );
}
