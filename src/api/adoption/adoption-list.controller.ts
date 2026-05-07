import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { GetAdoptionPetListUseCase } from './application/use-cases/get-adoption-pet-list.use-case';
import { GetPopularAdoptionPetsUseCase } from './application/use-cases/get-popular-adoption-pets.use-case';
import { ADOPTION_RESPONSE_MESSAGE_EXAMPLES } from './constants/adoption-response-messages';
import { AdoptionOptionalAuthController } from './decorator/adoption-protected-controller.decorator';
import { AdoptionListQueryDto, AdoptionPopularQueryDto } from './dto/request/adoption-list-query.dto';
import { AdoptionPetResponseDto } from './dto/response/adoption-pet-response.dto';
import { ApiGetAdoptionListEndpoint, ApiGetPopularAdoptionEndpoint } from './swagger';

/**
 * 입양 페이지 — 목록 + 인기 동물 (공개, 로그인 시 isFavorited 채움)
 */
@AdoptionOptionalAuthController()
export class AdoptionListController {
    constructor(
        private readonly getAdoptionPetListUseCase: GetAdoptionPetListUseCase,
        private readonly getPopularAdoptionPetsUseCase: GetPopularAdoptionPetsUseCase,
    ) {}

    @Get()
    @ApiGetAdoptionListEndpoint()
    async getList(
        @Query() query: AdoptionListQueryDto,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<PaginationResponseDto<AdoptionPetResponseDto>>> {
        const result = await this.getAdoptionPetListUseCase.execute({
            petType: query.petType,
            sort: query.sort,
            page: query.page,
            pageSize: query.pageSize,
            adopterId: userId,
        });
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            ADOPTION_RESPONSE_MESSAGE_EXAMPLES.listRetrieved,
        );
    }

    @Get('popular')
    @ApiGetPopularAdoptionEndpoint()
    async getPopular(
        @Query() query: AdoptionPopularQueryDto,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<AdoptionPetResponseDto[]>> {
        const result = await this.getPopularAdoptionPetsUseCase.execute({
            petType: query.petType,
            limit: query.limit,
            adopterId: userId,
        });
        return ApiResponseDto.success(result, ADOPTION_RESPONSE_MESSAGE_EXAMPLES.popularRetrieved);
    }
}
