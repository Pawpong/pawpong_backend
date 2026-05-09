import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';

import { GetMyAdoptionFavoritesUseCase } from './application/use-cases/get-my-adoption-favorites.use-case';
import { ADOPTION_RESPONSE_MESSAGE_EXAMPLES } from './constants/adoption-response-messages';
import { AdoptionProtectedController } from './decorator/adoption-protected-controller.decorator';
import { AdoptionMyFavoritesQueryDto } from './dto/request/adoption-my-favorites-query.dto';
import { AdoptionPetResponseDto } from './dto/response/adoption-pet-response.dto';
import { ApiGetMyAdoptionFavoritesEndpoint } from './swagger';

/**
 * GET /v2/adoption/me/favorites — 입양자 본인 즐겨찾기 펫 페이지네이션.
 * AdoptionProtectedController = StrictRolesGuard('adopter') 재사용.
 */
@AdoptionProtectedController()
export class AdoptionMyFavoritesController {
    constructor(private readonly useCase: GetMyAdoptionFavoritesUseCase) {}

    @Get('me/favorites')
    @ApiGetMyAdoptionFavoritesEndpoint()
    async list(
        @CurrentUser('userId') userId: string,
        @Query() query: AdoptionMyFavoritesQueryDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<AdoptionPetResponseDto>>> {
        const result = await this.useCase.execute({
            adopterId: userId,
            status: query.status,
            page: query.page,
            pageSize: query.pageSize,
        });
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            ADOPTION_RESPONSE_MESSAGE_EXAMPLES.myFavoritesRetrieved,
        );
    }
}
