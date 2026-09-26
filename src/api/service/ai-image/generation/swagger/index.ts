import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiProduces } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../../common/decorator/swagger.decorator';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../constants/ai-image-response-messages';
import { AiImageUploadUrlResponseDto } from '../dto/response/ai-image-upload-url-response.dto';
import { AiImageSourceUploadResponseDto } from '../dto/response/ai-image-source-upload-response.dto';
import { AiImageGenerationResponseDto } from '../dto/response/ai-image-generation-response.dto';

export function ApiAiImageProtectedController() {
    return ApiController('AI 이미지');
}

export function ApiCreateAiImageUploadUrlEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'AI 원본 사진 업로드 URL 발급',
            description: `
                원본 사진을 버킷에 직접 올릴 presigned PUT URL 을 발급합니다.
                서버가 이미지 바이트를 거치지 않으므로 대용량 업로드에도 API 응답이 막히지 않습니다.

                흐름: 이 API 로 URL 발급 → 클라이언트가 해당 URL 에 PUT → 받은 inputObjectKey 로 생성 요청.
                지원 형식은 jpg/png/webp 이며 HEIC 는 클라이언트에서 변환해야 합니다.
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

export function ApiUploadAiImageSourceEndpoint() {
    return applyDecorators(
        ApiConsumes('multipart/form-data'),
        ApiEndpoint({
            summary: 'AI 원본 사진 업로드',
            description: `
                원본 사진을 서버 경유로 올리고 inputObjectKey 를 돌려줍니다.
                웹·앱 웹뷰에서는 버킷 직업로드(presigned PUT)가 CORS 로 막히므로 이 API 를 씁니다.
                지원 형식은 jpg/png/webp, 최대 10MB 입니다. HEIC 는 클라이언트에서 변환해야 합니다.
            `,
            responseType: AiImageSourceUploadResponseDto,
            successDescription: '원본 업로드 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.sourceUploaded,
            errorResponses: [
                {
                    status: 400,
                    description: '파일 누락 또는 지원하지 않는 이미지 형식',
                    errorExample: '지원하지 않는 이미지 형식입니다. (jpg, png, webp 만 가능)',
                },
            ],
        }),
        ApiBody({
            schema: {
                type: 'object',
                required: ['file'],
                properties: { file: { type: 'string', format: 'binary' } },
            },
        }),
    );
}

export function ApiRequestAiImageGenerationEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: 'AI 이미지 생성 요청',
            description: `
                업로드한 원본 사진에 선택한 필터를 적용하는 생성 작업을 큐에 등록합니다.
                즉시 완료되지 않으며, 반환된 jobId 로 상태를 폴링해야 합니다(권장 2~3초 간격).

                생성 시점의 프롬프트·모델이 작업에 스냅샷으로 복사되므로,
                관리자가 이후 필터를 수정해도 진행 중 작업의 결과는 바뀌지 않습니다.

                사용자·콘테스트당 생성 횟수 제한이 있으며, 실패한 작업은 횟수에서 제외됩니다.
            `,
            responseType: AiImageGenerationResponseDto,
            successDescription: 'AI 생성 요청 접수',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.generationRequested,
            errorResponses: [
                {
                    status: 400,
                    description: '필터 없음 / 비활성 필터 / 생성 횟수 초과',
                    errorExample: 'AI 이미지 생성 횟수를 모두 사용했습니다. (최대 3회)',
                },
                {
                    status: 503,
                    description: '생성 대기열 사용 불가',
                    errorExample: 'AI 생성 대기열을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
                },
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
                작업 상태를 조회합니다. status 가 succeeded 가 되면 resultObjectKey 를
                콘테스트 출품 API(POST v2/contest/entry)의 photoFileName 으로 넘기면 됩니다.
            `,
            responseType: AiImageGenerationResponseDto,
            successDescription: 'AI 생성 상태 조회 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.generationRetrieved,
            errorResponses: [
                { status: 400, description: '작업 없음', errorExample: 'AI 생성 요청을 찾을 수 없습니다.' },
            ],
        }),
    );
}

export function ApiGetMyAiImageGenerationsEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '내 AI 생성 이력',
            description: '최근 생성 작업 목록(최신순). 남은 생성 횟수 표시에 사용합니다.',
            responseType: [AiImageGenerationResponseDto],
            successDescription: 'AI 생성 이력 조회 성공',
            successMessageExample: AI_IMAGE_RESPONSE_MESSAGES.generationsRetrieved,
        }),
    );
}

export function ApiGetAiImageGenerationImageEndpoint() {
    return applyDecorators(
        ApiOperation({
            summary: 'AI 생성 결과 이미지 받기',
            description: `
                본인의 완성된(succeeded) 생성 결과를 PNG 바이트로 내려줍니다.
                버킷에 CORS 가 없어 브라우저가 결과 URL 을 직접 읽을 수 없으므로,
                커뮤니티 글쓰기처럼 결과를 일반 사진으로 다시 올려야 하는 화면에서 씁니다.
            `,
        }),
        ApiParam({ name: 'jobId', description: '생성 작업 ID' }),
        ApiProduces('image/png'),
        ApiOkResponse({ description: 'PNG 이미지', schema: { type: 'string', format: 'binary' } }),
    );
}

export function ApiHideAiImageGenerationEndpoint() {
    return applyDecorators(
        ApiOperation({
            summary: '내 AI 사진 보관함에서 지우기',
            description: `
                보관함 목록에서 뺍니다. 기록은 남아 하루 생성 횟수에는 계속 포함됩니다.
                이미 커뮤니티에 올린 사진은 별도 파일이라 영향이 없습니다.
            `,
        }),
        ApiParam({ name: 'jobId', description: '생성 작업 ID' }),
        ApiOkResponse({ description: '숨김 완료' }),
    );
}
