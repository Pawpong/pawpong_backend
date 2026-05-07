import { applyDecorators } from '@nestjs/common';

import { ApiEndpoint, ApiPublicController } from '../../../common/decorator/swagger.decorator';
import { POPULAR_KEYWORD_RESPONSE_MESSAGE_EXAMPLES } from '../constants/popular-keyword-response-messages';
import { PopularKeywordResponseDto } from '../dto/response/popular-keyword-response.dto';

export function ApiPopularKeywordController() {
    return ApiPublicController('인기 검색어');
}

export function ApiGetActivePopularKeywordsEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '활성 인기 검색어 조회',
            description: `
                홈 화면 인기 검색어 영역에 노출될 활성 키워드 목록을 반환합니다.

                ## 주요 기능
                - rank 오름차순 정렬 (낮을수록 상단)
                - 어드민이 큐레이션한 키워드만 노출됩니다.
            `,
            responseType: [PopularKeywordResponseDto],
            isPublic: true,
            successDescription: '활성 인기 검색어 조회 성공',
            successMessageExample: POPULAR_KEYWORD_RESPONSE_MESSAGE_EXAMPLES.activePopularKeywordsRetrieved,
        }),
    );
}
