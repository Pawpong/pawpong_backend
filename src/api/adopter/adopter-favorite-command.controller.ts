import { Body, Delete, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { AddFavoriteBreederUseCase } from './application/use-cases/add-favorite-breeder.use-case';
import { RemoveFavoriteBreederUseCase } from './application/use-cases/remove-favorite-breeder.use-case';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { FavoriteAddRequestDto } from './dto/request/favorite-add-request.dto';
import { FavoriteAddResponseDto } from './dto/response/favorite-add-response.dto';
import { FavoriteRemoveResponseDto } from './dto/response/favorite-remove-response.dto';
import { ApiAddAdopterFavoriteEndpoint, ApiRemoveAdopterFavoriteEndpoint } from './swagger';

@AdopterProtectedController()
export class AdopterFavoriteCommandController {
    constructor(
        private readonly addFavoriteBreederUseCase: AddFavoriteBreederUseCase,
        private readonly removeFavoriteBreederUseCase: RemoveFavoriteBreederUseCase,
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
}
