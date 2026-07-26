import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../../service/ai-image/constants/ai-image-response-messages';
import { AiImageAdminFilterResponseDto, AiImageFilterDeleteResponseDto } from '../dto/response/ai-image-admin-filter-response.dto';
import { AiImageFilterPreviewResponseDto } from '../dto/response/ai-image-filter-preview-response.dto';

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

export function ApiGenerateAiImageFilterPreviewEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'AI 필터 미리보기 생성',
            description: `
                필터를 저장하지 않고 프롬프트를 즉시 시험한다. AI Agent 를 동기(gRPC) 호출하므로
                OpenAI 왕복 시간만큼 응답이 지연된다(최대 120초).

                Job 을 만들지 않으므로 사용자 쿼터·생성 이력에 영향이 없다.
                생성 실패는 200 응답의 isSuccess=false 와 errorCode 로 내려간다.
                AI Agent 자체에 연결하지 못한 경우에만 503 이 반환된다.
            `,
            responseType: AiImageFilterPreviewResponseDto,
            successDescription: 'AI 필터 미리보기 생성 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.filterPreviewGenerated,
            errorResponses: [
                {
                    status: 503,
                    description: 'AI Agent 미기동 또는 연결 실패',
                    errorExample: 'AI Agent에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
                },
            ],
        }),
    );
}
