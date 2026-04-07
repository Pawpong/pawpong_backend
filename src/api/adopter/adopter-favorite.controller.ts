import { Body, Delete, Get, Param, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { AddFavoriteBreederUseCase } from './application/use-cases/add-favorite-breeder.use-case';
import { GetFavoriteBreedersUseCase } from './application/use-cases/get-favorite-breeders.use-case';
import { RemoveFavoriteBreederUseCase } from './application/use-cases/remove-favorite-breeder.use-case';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { FavoriteAddRequestDto } from './dto/request/favorite-add-request.dto';
import { FavoriteAddResponseDto } from './dto/response/favorite-add-response.dto';
import { FavoriteListResponseDto } from './dto/response/favorite-list-response.dto';
import { FavoriteRemoveResponseDto } from './dto/response/favorite-remove-response.dto';
import {
    ApiAddAdopterFavoriteEndpoint,
    ApiGetAdopterFavoritesEndpoint,
    ApiRemoveAdopterFavoriteEndpoint,
} from './swagger';

@AdopterProtectedController()
export class AdopterFavoriteController {
    constructor(
        private readonly addFavoriteBreederUseCase: AddFavoriteBreederUseCase,
        private readonly removeFavoriteBreederUseCase: RemoveFavoriteBreederUseCase,
        private readonly getFavoriteBreedersUseCase: GetFavoriteBreedersUseCase,
    ) {}

    @Post('favorite')
    @ApiAddAdopterFavoriteEndpoint()
    async addFavorite(
        @CurrentUser('userId') userId: string,
        @Body() addFavoriteDto: FavoriteAddRequestDto,
    ): Promise<ApiResponseDto<FavoriteAddResponseDto>> {
        const result = await this.addFavoriteBreederUseCase.execute(userId, addFavoriteDto);
        return ApiResponseDto.success(result, '즐겨찾기에 성공적으로 추가되었습니다.');
    }

    @Delete('favorite/:breederId')
    @ApiRemoveAdopterFavoriteEndpoint()
    async removeFavorite(
        @CurrentUser('userId') userId: string,
        @Param('breederId') breederId: string,
    ): Promise<ApiResponseDto<FavoriteRemoveResponseDto>> {
        const result = await this.removeFavoriteBreederUseCase.execute(userId, breederId);
        return ApiResponseDto.success(result, '즐겨찾기에서 성공적으로 삭제되었습니다.');
    }

    @Get('favorites')
    @ApiGetAdopterFavoritesEndpoint()
    async getFavorites(
        @CurrentUser('userId') userId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<ApiResponseDto<FavoriteListResponseDto>> {
        const result = await this.getFavoriteBreedersUseCase.execute(userId, Number(page), Number(limit));
        return ApiResponseDto.success(result, '즐겨찾기 목록이 조회되었습니다.');
    }
}
