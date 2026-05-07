import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

import { ApiEndpoint, ApiPublicController } from '../../../common/decorator/swagger.decorator';
import { TERMS_RESPONSE_MESSAGE_EXAMPLES } from '../constants/terms-response-messages';
import { TERMS_CODE_VALUES, TERMS_NOT_FOUND_RESPONSE } from '../constants/terms-swagger.constants';
import { TermsResponseDto } from '../dto/response/terms-response.dto';

export function ApiTermsController() {
    return ApiPublicController('약관');
}

export function ApiGetActiveTermsListEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '활성 약관 목록 조회',
            description: `
                현재 활성 상태인 약관 목록을 반환합니다.

                ## 주요 기능
                - 가입/온보딩 화면에서 동의받을 약관을 일괄 조회합니다.
                - 코드별로 활성 버전 1개만 노출됩니다.
                - 필수 약관(isRequired=true)이 상단에 정렬됩니다.
            `,
            responseType: [TermsResponseDto],
            isPublic: true,
            successDescription: '활성 약관 목록 조회 성공',
            successMessageExample: TERMS_RESPONSE_MESSAGE_EXAMPLES.activeTermsListRetrieved,
        }),
    );
}

export function ApiGetActiveTermByCodeEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '활성 약관 단건 조회',
            description: `
                특정 약관 코드의 활성 버전 본문을 조회합니다.

                ## 주요 기능
                - "자세히 보기" 모달에서 약관 본문을 가져올 때 사용합니다.
                - 활성 버전이 없으면 400을 반환합니다.
            `,
            responseType: TermsResponseDto,
            isPublic: true,
            successDescription: '활성 약관 조회 성공',
            successMessageExample: TERMS_RESPONSE_MESSAGE_EXAMPLES.activeTermDetailRetrieved,
            errorResponses: [TERMS_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'code',
            description: '약관 코드',
            example: 'service',
            enum: TERMS_CODE_VALUES,
        }),
    );
}
