import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetFavoriteBreedersUseCase } from './application/use-cases/get-favorite-breeders.use-case';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { AdopterPaginationQueryRequestDto } from './dto/request/adopter-pagination-query-request.dto';
import { FavoriteListResponseDto } from './dto/response/favorite-list-response.dto';
import { ADOPTER_RESPONSE_MESSAGES } from './constants/adopter-response-messages';
import { ApiGetAdopterFavoritesEndpoint } from './swagger';

@AdopterProtectedController()
export class AdopterFavoriteQueryController {
    constructor(private readonly getFavoriteBreedersUseCase: GetFavoriteBreedersUseCase) {}

    @Get('favorites')
    @ApiGetAdopterFavoritesEndpoint()
    async getFavorites(
        @CurrentUser('userId') userId: string,
        @Query() query: AdopterPaginationQueryRequestDto,
    ): Promise<ApiResponseDto<FavoriteListResponseDto>> {
        const result = await this.getFavoriteBreedersUseCase.execute(userId, query.page, query.limit);
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result) as FavoriteListResponseDto,
            ADOPTER_RESPONSE_MESSAGES.favoriteListRetrieved,
        );
    }
}
