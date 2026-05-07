import { Body, Delete, Param, Patch, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PopularKeywordResponseDto } from '../dto/response/popular-keyword-response.dto';
import { CreatePopularKeywordUseCase } from './application/use-cases/create-popular-keyword.use-case';
import { DeletePopularKeywordUseCase } from './application/use-cases/delete-popular-keyword.use-case';
import { UpdatePopularKeywordUseCase } from './application/use-cases/update-popular-keyword.use-case';
import { POPULAR_KEYWORD_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from './constants/popular-keyword-admin-response-messages';
import { PopularKeywordAdminControllerBase } from './decorator/popular-keyword-admin-controller.decorator';
import { CreatePopularKeywordRequestDto } from './dto/request/create-popular-keyword-request.dto';
import { UpdatePopularKeywordRequestDto } from './dto/request/update-popular-keyword-request.dto';
import {
    ApiCreatePopularKeywordAdminEndpoint,
    ApiDeletePopularKeywordAdminEndpoint,
    ApiUpdatePopularKeywordAdminEndpoint,
} from './swagger';

@PopularKeywordAdminControllerBase()
export class PopularKeywordAdminCommandController {
    constructor(
        private readonly createUseCase: CreatePopularKeywordUseCase,
        private readonly updateUseCase: UpdatePopularKeywordUseCase,
        private readonly deleteUseCase: DeletePopularKeywordUseCase,
    ) {}

    @Post()
    @ApiCreatePopularKeywordAdminEndpoint()
    async create(@Body() dto: CreatePopularKeywordRequestDto): Promise<ApiResponseDto<PopularKeywordResponseDto>> {
        const result = await this.createUseCase.execute(dto);
        return ApiResponseDto.success(result, POPULAR_KEYWORD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.popularKeywordCreated);
    }

    @Patch(':id')
    @ApiUpdatePopularKeywordAdminEndpoint()
    async update(
        @Param('id') id: string,
        @Body() dto: UpdatePopularKeywordRequestDto,
    ): Promise<ApiResponseDto<PopularKeywordResponseDto>> {
        const result = await this.updateUseCase.execute(id, dto);
        return ApiResponseDto.success(result, POPULAR_KEYWORD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.popularKeywordUpdated);
    }

    @Delete(':id')
    @ApiDeletePopularKeywordAdminEndpoint()
    async delete(@Param('id') id: string): Promise<ApiResponseDto<null>> {
        await this.deleteUseCase.execute(id);
        return ApiResponseDto.success(null, POPULAR_KEYWORD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.popularKeywordDeleted);
    }
}
