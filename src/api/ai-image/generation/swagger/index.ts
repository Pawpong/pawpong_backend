import { applyDecorators } from '@nestjs/common';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../constants/ai-image-response-messages';
import { AiImageUploadUrlResponseDto } from '../dto/response/ai-image-upload-url-response.dto';

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
