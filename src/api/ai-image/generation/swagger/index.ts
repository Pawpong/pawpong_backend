import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../constants/ai-image-response-messages';
import { AiImageUploadUrlResponseDto } from '../dto/response/ai-image-upload-url-response.dto';
import { AiImageGenerationResponseDto } from '../dto/response/ai-image-generation-response.dto';

export function ApiAiImageProtectedController() {
    return ApiController('AI 이미지 (v2)');
}

export function ApiCreateAiImageUploadUrlEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'AI 원본 사진 업로드 URL 발급',
            description: `
                원본 사진을 버킷에 직접 올릴 presigned PUT URL 을 발급한다.
                서버가 이미지 바이트를 거치지 않으므로 대용량 업로드에도 API 응답이 막히지 않는다.

                흐름: 이 API 로 URL 발급 → 클라이언트가 해당 URL 에 PUT → 받은 inputObjectKey 로 생성 요청.
                지원 형식은 jpg/png/webp 이며 HEIC 는 클라이언트에서 변환해야 한다.
            `,
            responseType: AiImageUploadUrlResponseDto,
            successDescription: '업로드 URL 발급 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.uploadUrlIssued,
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

export function ApiRequestAiImageGenerationEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'AI 이미지 생성 요청',
            description: `
                업로드한 원본 사진에 선택한 필터를 적용하는 생성 작업을 큐에 등록한다.
                즉시 완료되지 않으며, 반환된 jobId 로 상태를 폴링해야 한다(권장 2~3초 간격).

                생성 시점의 프롬프트·모델이 작업에 스냅샷으로 복사되므로,
                관리자가 이후 필터를 수정해도 진행 중 작업의 결과는 바뀌지 않는다.

                사용자·콘테스트당 생성 횟수 제한이 있으며, 실패한 작업은 횟수에서 제외된다.
            `,
            responseType: AiImageGenerationResponseDto,
            successDescription: 'AI 생성 요청 접수',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.generationRequested,
            errorResponses: [
                { status: 400, description: '필터 없음 / 비활성 필터 / 생성 횟수 초과', errorExample: 'AI 이미지 생성 횟수를 모두 사용했습니다. (최대 3회)' },
                { status: 503, description: '생성 대기열 사용 불가', errorExample: 'AI 생성 대기열을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.' },
            ],
        }),
    );
}

export function ApiGetAiImageGenerationEndpoint() {
    return applyDecorators(
        ApiParam({ name: 'jobId', description: '생성 작업 ID', example: '507f1f77bcf86cd799439011' }),
        ApiEndpoint({
            summary: 'AI 생성 상태 조회 (폴링)',
            description: `
                작업 상태를 조회한다. status 가 succeeded 가 되면 resultObjectKey 를
                콘테스트 출품 API(POST v2/contest/entry)의 photoFileName 으로 넘기면 된다.
            `,
            responseType: AiImageGenerationResponseDto,
            successDescription: 'AI 생성 상태 조회 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.generationRetrieved,
            errorResponses: [{ status: 400, description: '작업 없음', errorExample: 'AI 생성 요청을 찾을 수 없습니다.' }],
        }),
    );
}

export function ApiGetMyAiImageGenerationsEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '내 AI 생성 이력',
            description: '최근 생성 작업 목록(최신순). 남은 생성 횟수 표시에 사용한다.',
            responseType: [AiImageGenerationResponseDto],
            successDescription: 'AI 생성 이력 조회 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.generationsRetrieved,
        }),
    );
}
