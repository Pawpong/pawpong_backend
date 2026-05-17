import { Controller, Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetActivePopularKeywordsUseCase } from '../application/use-cases/get-active-popular-keywords.use-case';
import { POPULAR_KEYWORD_RESPONSE_MESSAGE_EXAMPLES } from '../constants/popular-keyword-response-messages';
import { PopularKeywordResponseDto } from '../dto/response/popular-keyword-response.dto';
import { ApiGetActivePopularKeywordsEndpoint, ApiPopularKeywordController } from '../swagger';

/**
 * 인기 검색어 컨트롤러 (공개)
 * 홈 화면 인기 검색어 칩 노출용
 */
@ApiPopularKeywordController()
@Controller('v2/popular-keyword')
export class PopularKeywordController {
    constructor(private readonly getActivePopularKeywordsUseCase: GetActivePopularKeywordsUseCase) {}

    @Get()
    @ApiGetActivePopularKeywordsEndpoint()
    async getActivePopularKeywords(): Promise<ApiResponseDto<PopularKeywordResponseDto[]>> {
        const result = await this.getActivePopularKeywordsUseCase.execute();
        return ApiResponseDto.success(result, POPULAR_KEYWORD_RESPONSE_MESSAGE_EXAMPLES.activePopularKeywordsRetrieved);
    }
}
