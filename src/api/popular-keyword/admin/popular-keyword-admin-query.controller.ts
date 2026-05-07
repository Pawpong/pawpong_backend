import { Get, Param } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PopularKeywordResponseDto } from '../dto/response/popular-keyword-response.dto';
import { GetAllPopularKeywordsAdminUseCase } from './application/use-cases/get-all-popular-keywords-admin.use-case';
import { GetPopularKeywordByIdUseCase } from './application/use-cases/get-popular-keyword-by-id.use-case';
import { POPULAR_KEYWORD_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from './constants/popular-keyword-admin-response-messages';
import { PopularKeywordAdminControllerBase } from './decorator/popular-keyword-admin-controller.decorator';
import {
    ApiGetAllPopularKeywordsAdminEndpoint,
    ApiGetPopularKeywordByIdAdminEndpoint,
} from './swagger';

@PopularKeywordAdminControllerBase()
export class PopularKeywordAdminQueryController {
    constructor(
        private readonly getAllUseCase: GetAllPopularKeywordsAdminUseCase,
        private readonly getByIdUseCase: GetPopularKeywordByIdUseCase,
    ) {}

    @Get()
    @ApiGetAllPopularKeywordsAdminEndpoint()
    async getAll(): Promise<ApiResponseDto<PopularKeywordResponseDto[]>> {
        const result = await this.getAllUseCase.execute();
        return ApiResponseDto.success(
            result,
            POPULAR_KEYWORD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.popularKeywordsListRetrieved,
        );
    }

    @Get(':id')
    @ApiGetPopularKeywordByIdAdminEndpoint()
    async getById(@Param('id') id: string): Promise<ApiResponseDto<PopularKeywordResponseDto>> {
        const result = await this.getByIdUseCase.execute(id);
        return ApiResponseDto.success(result, POPULAR_KEYWORD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.popularKeywordRetrieved);
    }
}
