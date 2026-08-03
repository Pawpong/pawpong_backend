import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { AiImageJobStatus } from '../../../../common/enum/ai-image-job-status.enum';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../../service/ai-image/constants/ai-image-response-messages';
import {
    AiImageAdminFilterResponseDto,
    AiImageFilterDeleteResponseDto,
} from '../dto/response/ai-image-admin-filter-response.dto';
import { AiImageFilterPreviewResponseDto } from '../dto/response/ai-image-filter-preview-response.dto';
import { AiImageAdminUploadUrlResponseDto } from '../dto/response/ai-image-admin-upload-url-response.dto';
import { AiImageAgentHealthResponseDto } from '../dto/response/ai-image-agent-health-response.dto';
import { AiImageAdminJobResponseDto } from '../dto/response/ai-image-admin-job-response.dto';

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
            description: '비활성 필터를 포함한 전체 목록. 프롬프트가 포함되므로 관리자 전용입니다.',
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
            description: '사용자가 선택할 수 있는 이미지 변환 필터를 등록합니다.',
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
                필터를 부분 수정합니다.
                이미 생성된 작업은 생성 시점의 프롬프트·모델 스냅샷을 사용하므로 결과가 바뀌지 않습니다.
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
            description: '필터를 삭제합니다. 기존 생성 작업은 스냅샷을 보유하므로 영향받지 않습니다.',
            responseType: AiImageFilterDeleteResponseDto,
            successDescription: 'AI 필터 삭제 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.filterDeleted,
            errorResponses: [FILTER_NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiCreateAiImageAdminUploadUrlEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'AI 필터 애셋 업로드 URL 발급',
            description: `
                필터 썸네일·스타일 레퍼런스·미리보기 원본을 버킷에 직접 올릴 presigned PUT URL 을 발급합니다.
                서버가 이미지 바이트를 중계하지 않습니다.

                ## 사용 순서
                1. 이 API 로 uploadUrl 과 objectKey 를 받습니다
                2. uploadUrl 로 이미지를 PUT 합니다 (Content-Type 을 요청 시 보낸 값과 동일하게)
                3. 받은 objectKey 를 필터 생성/수정의 thumbnailFileName·referenceImageObjectKeys 나
                   미리보기의 inputObjectKey 로 넘깁니다

                용도(purpose)에 따라 키 경로가 나뉩니다 — thumbnail: ai-image/filter, reference: ai-image/reference,
                source: ai-image/source.
            `,
            responseType: AiImageAdminUploadUrlResponseDto,
            successDescription: '업로드 URL 발급 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.adminUploadUrlIssued,
            errorResponses: [
                {
                    status: 400,
                    description: '지원하지 않는 이미지 형식',
                    errorExample: '지원하지 않는 이미지 형식입니다. (jpg, png, webp 만 가능)',
                },
            ],
        }),
    );
}

export function ApiGetAiImageAgentHealthEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'AI Agent 가동 상태 조회',
            description: `
                AI Agent 를 gRPC 로 즉시 조회합니다(타임아웃 5초). 미리보기는 OpenAI 왕복 때문에
                최대 120초가 걸리므로, 누르기 전에 지금 눌러도 되는 상태인지 확인하는 용도입니다.

                ## 상태 해석
                - SERVING: Kafka 연결 + OpenAI 키 정상. 생성·미리보기 모두 가능
                - DEGRADED: 프로세스는 살아 있으나 Kafka 또는 OpenAI 키가 빠짐. 생성 요청이 즉시 실패로 회신됨
                - UNREACHABLE: 에이전트에 닿지 못함(컨테이너 미기동·네트워크 단절)

                연결 실패도 200 으로 내려갑니다 — 에이전트가 죽었다는 사실 자체가 조회 결과이기 때문입니다.
            `,
            responseType: AiImageAgentHealthResponseDto,
            successDescription: 'AI Agent 상태 조회 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.agentHealthRetrieved,
        }),
    );
}

export function ApiGetAiImageJobsEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: 'AI 생성 작업 목록 조회',
            description: `
                사용자 생성 작업을 최신순으로 조회합니다. 상태·사용자·필터로 좁힐 수 있습니다.

                ## 용도
                결과 컨슈머는 처리 실패 시 예외를 던지지 않고 로그만 남기므로
                (throw 하면 오프셋 커밋이 막혀 같은 메시지를 무한 재처리합니다),
                실패로 확정된 작업은 이 목록으로 확인합니다.

                프롬프트·모델 스냅샷이 포함되므로 관리자 전용입니다. 필터를 수정한 뒤에도
                그 작업이 실제로 어떤 프롬프트로 돌았는지 추적할 수 있습니다.
            `,
            responseType: PaginationResponseDto,
            itemType: AiImageAdminJobResponseDto,
            successDescription: 'AI 생성 작업 목록 조회 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.jobsRetrieved,
        }),
        ApiQuery({
            name: 'status',
            required: false,
            enum: AiImageJobStatus,
            description: '작업 상태 필터',
            example: AiImageJobStatus.FAILED,
        }),
        ApiQuery({
            name: 'userId',
            required: false,
            type: String,
            description: '요청 사용자 ID 필터',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiQuery({
            name: 'filterId',
            required: false,
            type: String,
            description: 'AI 필터 ID 필터',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}

export function ApiGenerateAiImageFilterPreviewEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'AI 필터 미리보기 생성',
            description: `
                필터를 저장하지 않고 프롬프트를 즉시 시험합니다. AI Agent 를 동기(gRPC) 호출하므로
                OpenAI 왕복 시간만큼 응답이 지연됩니다(최대 120초).

                Job 을 만들지 않으므로 사용자 쿼터·생성 이력에 영향이 없습니다.
                생성 실패는 200 응답의 isSuccess=false 와 errorCode 로 내려갑니다.
                AI Agent 자체에 연결하지 못한 경우에만 503 이 반환됩니다.
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
