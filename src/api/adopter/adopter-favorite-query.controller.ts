import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetFavoriteBreedersUseCase } from './application/use-cases/get-favorite-breeders.use-case';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { FavoriteListResponseDto } from './dto/response/favorite-list-response.dto';
import { ADOPTER_RESPONSE_MESSAGES } from './domain/services/adopter-response-message.service';
import { ApiGetAdopterFavoritesEndpoint } from './swagger';

@AdopterProtectedController()
export class AdopterFavoriteQueryController {
    constructor(private readonly getFavoriteBreedersUseCase: GetFavoriteBreedersUseCase) {}

    @Get('favorites')
    @ApiGetAdopterFavoritesEndpoint()
    async getFavorites(
        @CurrentUser('userId') userId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<ApiResponseDto<FavoriteListResponseDto>> {
        const result = await this.getFavoriteBreedersUseCase.execute(userId, Number(page), Number(limit));
        return ApiResponseDto.success(result, ADOPTER_RESPONSE_MESSAGES.favoriteListRetrieved);
    }
}
